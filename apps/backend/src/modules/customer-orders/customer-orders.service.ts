import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { prisma, Prisma, TransactionType } from '@ims/database';
import { CreateCustomerOrderDto } from './dto/create-customer-order.dto';
import { UpdateCustomerOrderDto } from './dto/update-customer-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RecordOrderPaymentDto } from './dto/record-order-payment.dto';
import { RecordOrderDispatchDto } from './dto/record-order-dispatch.dto';

@Injectable()
export class CustomerOrdersService {
  /**
   * Helper to generate unique Order Number (e.g. ORD-2026-0001)
   */
  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ORD-${year}-`;
    const count = await prisma.customerOrder.count();
    const seq = String(count + 1).padStart(4, '0');
    let orderNumber = `${prefix}${seq}`;
    let exists = await prisma.customerOrder.findUnique({ where: { orderNumber } });
    let counter = count + 1;
    while (exists) {
      counter++;
      orderNumber = `${prefix}${String(counter).padStart(4, '0')}`;
      exists = await prisma.customerOrder.findUnique({ where: { orderNumber } });
    }
    return orderNumber;
  }

  /**
   * List customer orders with search, customerId, status, priority, paymentStatus filters
   */
  async findAll(query: {
    search?: string;
    customerId?: string;
    status?: string;
    priority?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerOrderWhereInput = {};

    if (query.customerId) {
      where.customerId = query.customerId;
    }
    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query.priority) {
      where.priority = query.priority;
    }
    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }
    if (query.startDate || query.endDate) {
      where.orderDate = {};
      if (query.startDate) where.orderDate.gte = new Date(query.startDate);
      if (query.endDate) where.orderDate.lte = new Date(query.endDate);
    }

    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        { customer: { code: { contains: query.search, mode: 'insensitive' } } },
        { trackingNumber: { contains: query.search, mode: 'insensitive' } },
        { items: { some: { itemName: { contains: query.search, mode: 'insensitive' } } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.customerOrder.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              code: true,
              name: true,
              contactPerson: true,
              phone: true,
              email: true,
              city: true,
              state: true,
              gstin: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.customerOrder.count({ where }),
    ]);

    const formatted = items.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      taxAmount: Number(o.taxAmount),
      discountAmount: Number(o.discountAmount),
      shippingCharges: Number(o.shippingCharges),
      totalAmount: Number(o.totalAmount),
      paidAmount: Number(o.paidAmount),
      items: o.items.map((i) => ({
        ...i,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        taxRate: Number(i.taxRate),
        taxAmount: Number(i.taxAmount),
        discount: Number(i.discount),
        totalPrice: Number(i.totalPrice),
        deliveredQuantity: Number(i.deliveredQuantity),
      })),
    }));

    return {
      items: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get Orders KPI Statistics Summary
   */
  async getStats() {
    const allOrders = await prisma.customerOrder.findMany({
      select: {
        totalAmount: true,
        paidAmount: true,
        status: true,
        paymentStatus: true,
      },
    });

    let totalOrdersValue = 0;
    let totalPaidAmount = 0;
    let confirmedCount = 0;
    let partiallyDispatchedCount = 0;
    let dispatchedCount = 0;
    let cancelledCount = 0;

    allOrders.forEach((o) => {
      const val = Number(o.totalAmount || 0);
      const paid = Number(o.paidAmount || 0);
      totalOrdersValue += val;
      totalPaidAmount += paid;

      if (o.status === 'CONFIRMED' || o.status === 'DRAFT' || o.status === 'IN_PRODUCTION' || o.status === 'READY_FOR_DISPATCH') {
        confirmedCount++;
      } else if (o.status === 'PARTIALLY_DISPATCHED') {
        partiallyDispatchedCount++;
      } else if (o.status === 'DISPATCHED' || o.status === 'DELIVERED') {
        dispatchedCount++;
      } else if (o.status === 'CANCELLED') {
        cancelledCount++;
      }
    });

    return {
      totalOrdersCount: allOrders.length,
      totalOrdersValue,
      totalPaidAmount,
      pendingPaymentAmount: Math.max(0, totalOrdersValue - totalPaidAmount),
      confirmedCount,
      partiallyDispatchedCount,
      dispatchedCount,
      cancelledCount,
    };
  }

  /**
   * Get single order details with full line items, customer profile, and status audit history
   */
  async findOne(id: string) {
    const order = await prisma.customerOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                unit: true,
                category: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          include: {
            changedByUser: {
              select: { id: true, email: true },
            },
          },
        },
        createdBy: {
          select: { id: true, email: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Customer Order with ID ${id} not found.`);
    }

    return {
      ...order,
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      discountAmount: Number(order.discountAmount),
      shippingCharges: Number(order.shippingCharges),
      totalAmount: Number(order.totalAmount),
      paidAmount: Number(order.paidAmount),
      items: order.items.map((i) => ({
        ...i,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        taxRate: Number(i.taxRate),
        taxAmount: Number(i.taxAmount),
        discount: Number(i.discount),
        totalPrice: Number(i.totalPrice),
        deliveredQuantity: Number(i.deliveredQuantity),
      })),
    };
  }

  /**
   * Create a new Customer Order with nested line items and financial calculations
   */
  async create(dto: CreateCustomerOrderDto, userId?: string) {
    // Validate Customer exists
    const customer = await prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${dto.customerId} not found.`);
    }

    let orderNumber = dto.orderNumber;
    if (!orderNumber || orderNumber.trim() === '') {
      orderNumber = await this.generateOrderNumber();
    } else {
      const exists = await prisma.customerOrder.findUnique({ where: { orderNumber } });
      if (exists) {
        throw new ConflictException(`Order Number "${orderNumber}" already exists.`);
      }
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('At least one line item is required to create a customer order.');
    }

    // Compute line items and order totals
    let calculatedSubtotal = 0;
    let calculatedTaxAmount = 0;
    let calculatedDiscount = dto.discountAmount || 0;
    const shipping = dto.shippingCharges || 0;

    const lineItemsData = dto.items.map((item) => {
      const qty = Number(item.quantity) || 1;
      const rate = Number(item.unitPrice) || 0;
      const taxRate = Number(item.taxRate) || 0;
      const itemDisc = Number(item.discount) || 0;

      const baseAmount = Math.max(0, qty * rate - itemDisc);
      const itemTax = (baseAmount * taxRate) / 100;
      const lineTotal = baseAmount + itemTax;

      calculatedSubtotal += baseAmount;
      calculatedTaxAmount += itemTax;

      return {
        productId: item.productId || null,
        itemCode: item.itemCode || null,
        itemName: item.itemName,
        specification: item.specification || null,
        quantity: qty,
        uom: item.uom || 'Pcs',
        unitPrice: rate,
        taxRate: taxRate,
        taxAmount: itemTax,
        discount: itemDisc,
        totalPrice: lineTotal,
        deliveredQuantity: 0,
        notes: item.notes || null,
      };
    });

    const netTotal = Math.max(0, calculatedSubtotal + calculatedTaxAmount + shipping - calculatedDiscount);
    const initialStatus = dto.status || 'CONFIRMED';
    const isPaidUpfront = dto.paymentStatus === 'PAID';

    return await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.customerOrder.create({
        data: {
          orderNumber,
          customerId: dto.customerId,
          orderDate: dto.orderDate ? new Date(dto.orderDate) : new Date(),
          deliveryDueDate: dto.deliveryDueDate ? new Date(dto.deliveryDueDate) : null,
          status: initialStatus,
          priority: dto.priority || 'NORMAL',
          paymentStatus: isPaidUpfront ? 'PAID' : 'PENDING',
          paymentMethod: dto.paymentMethod || null,
          subtotal: calculatedSubtotal,
          taxAmount: calculatedTaxAmount,
          discountAmount: calculatedDiscount,
          shippingCharges: shipping,
          totalAmount: netTotal,
          paidAmount: isPaidUpfront ? netTotal : 0,
          dlNo: dto.dlNo || customer.dlNo || null,
          regdNo: dto.regdNo || customer.regdNo || null,
          transportName: dto.transportName || customer.transportName || null,
          shippingAddress: dto.shippingAddress || customer.shippingAddress || customer.address || null,
          billingAddress: dto.billingAddress || customer.address || null,
          transportMode: dto.transportMode || 'ROAD',
          trackingNumber: dto.trackingNumber || null,
          notes: dto.notes || null,
          createdById: userId || null,
          items: {
            create: lineItemsData,
          },
          statusHistory: {
            create: {
              toStatus: initialStatus,
              notes: `Order created in system (${isPaidUpfront ? 'Paid Upfront' : 'To Be Paid / Pay After Delivery'})`,
              changedById: userId || null,
            },
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });

      return createdOrder;
    });
  }

  /**
   * Update existing customer order
   */
  async update(id: string, dto: UpdateCustomerOrderDto, userId?: string) {
    const order = await this.findOne(id);

    if (dto.orderNumber && dto.orderNumber !== order.orderNumber) {
      const exists = await prisma.customerOrder.findUnique({ where: { orderNumber: dto.orderNumber } });
      if (exists) {
        throw new ConflictException(`Order Number "${dto.orderNumber}" already exists.`);
      }
    }

    return await prisma.$transaction(async (tx) => {
      // If new line items are provided, replace items and recalculate
      if (dto.items && dto.items.length > 0) {
        await tx.customerOrderItem.deleteMany({ where: { orderId: id } });

        let calculatedSubtotal = 0;
        let calculatedTaxAmount = 0;
        const shipping = dto.shippingCharges !== undefined ? Number(dto.shippingCharges) : Number(order.shippingCharges);
        const discount = dto.discountAmount !== undefined ? Number(dto.discountAmount) : Number(order.discountAmount);

        const lineItemsData = dto.items.map((item) => {
          const qty = Number(item.quantity) || 1;
          const rate = Number(item.unitPrice) || 0;
          const taxRate = Number(item.taxRate) || 0;
          const itemDisc = Number(item.discount) || 0;

          const baseAmount = Math.max(0, qty * rate - itemDisc);
          const itemTax = (baseAmount * taxRate) / 100;
          const lineTotal = baseAmount + itemTax;

          calculatedSubtotal += baseAmount;
          calculatedTaxAmount += itemTax;

          return {
            orderId: id,
            productId: item.productId || null,
            itemCode: item.itemCode || null,
            itemName: item.itemName,
            specification: item.specification || null,
            quantity: qty,
            uom: item.uom || 'Pcs',
            unitPrice: rate,
            taxRate: taxRate,
            taxAmount: itemTax,
            discount: itemDisc,
            totalPrice: lineTotal,
            deliveredQuantity: 0,
            notes: item.notes || null,
          };
        });

        await tx.customerOrderItem.createMany({ data: lineItemsData });

        const netTotal = Math.max(0, calculatedSubtotal + calculatedTaxAmount + shipping - discount);

        return await tx.customerOrder.update({
          where: { id },
          data: {
            ...(dto.customerId !== undefined && { customerId: dto.customerId }),
            ...(dto.orderNumber !== undefined && { orderNumber: dto.orderNumber }),
            ...(dto.orderDate !== undefined && { orderDate: new Date(dto.orderDate) }),
            ...(dto.deliveryDueDate !== undefined && {
              deliveryDueDate: dto.deliveryDueDate ? new Date(dto.deliveryDueDate) : null,
            }),
            ...(dto.status !== undefined && { status: dto.status }),
            ...(dto.priority !== undefined && { priority: dto.priority }),
            ...(dto.paymentStatus !== undefined && { paymentStatus: dto.paymentStatus }),
            ...(dto.paymentMethod !== undefined && { paymentMethod: dto.paymentMethod }),
            subtotal: calculatedSubtotal,
            taxAmount: calculatedTaxAmount,
            discountAmount: discount,
            shippingCharges: shipping,
            totalAmount: netTotal,
            ...(dto.dlNo !== undefined && { dlNo: dto.dlNo }),
            ...(dto.regdNo !== undefined && { regdNo: dto.regdNo }),
            ...(dto.transportName !== undefined && { transportName: dto.transportName }),
            ...(dto.shippingAddress !== undefined && { shippingAddress: dto.shippingAddress }),
            ...(dto.billingAddress !== undefined && { billingAddress: dto.billingAddress }),
            ...(dto.transportMode !== undefined && { transportMode: dto.transportMode }),
            ...(dto.trackingNumber !== undefined && { trackingNumber: dto.trackingNumber }),
            ...(dto.notes !== undefined && { notes: dto.notes }),
          },
          include: {
            customer: true,
            items: true,
          },
        });
      }

      // If updating only basic fields
      return await tx.customerOrder.update({
        where: { id },
        data: {
          ...(dto.customerId !== undefined && { customerId: dto.customerId }),
          ...(dto.orderNumber !== undefined && { orderNumber: dto.orderNumber }),
          ...(dto.orderDate !== undefined && { orderDate: new Date(dto.orderDate) }),
          ...(dto.deliveryDueDate !== undefined && {
            deliveryDueDate: dto.deliveryDueDate ? new Date(dto.deliveryDueDate) : null,
          }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.priority !== undefined && { priority: dto.priority }),
          ...(dto.paymentStatus !== undefined && { paymentStatus: dto.paymentStatus }),
          ...(dto.paymentMethod !== undefined && { paymentMethod: dto.paymentMethod }),
          ...(dto.shippingCharges !== undefined && { shippingCharges: dto.shippingCharges }),
          ...(dto.discountAmount !== undefined && { discountAmount: dto.discountAmount }),
          ...(dto.dlNo !== undefined && { dlNo: dto.dlNo }),
          ...(dto.regdNo !== undefined && { regdNo: dto.regdNo }),
          ...(dto.transportName !== undefined && { transportName: dto.transportName }),
          ...(dto.shippingAddress !== undefined && { shippingAddress: dto.shippingAddress }),
          ...(dto.billingAddress !== undefined && { billingAddress: dto.billingAddress }),
          ...(dto.transportMode !== undefined && { transportMode: dto.transportMode }),
          ...(dto.trackingNumber !== undefined && { trackingNumber: dto.trackingNumber }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
        },
        include: {
          customer: true,
          items: true,
        },
      });
    });
  }

  /**
   * Transition order status with history log
   */
  async updateStatus(id: string, dto: UpdateOrderStatusDto, userId?: string) {
    const order = await this.findOne(id);
    const prevStatus = order.status;

    if (prevStatus === dto.status) {
      return order;
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.customerOrder.update({
        where: { id },
        data: {
          status: dto.status,
          ...(dto.status === 'DISPATCHED' && { dispatchDate: new Date() }),
        },
        include: {
          customer: true,
          items: true,
        },
      });

      await tx.customerOrderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: prevStatus,
          toStatus: dto.status,
          notes: dto.notes || `Status advanced from ${prevStatus} to ${dto.status}`,
          changedById: userId || null,
        },
      });

      return updated;
    });
  }

  /**
   * Record payment for customer order
   */
  async recordPayment(id: string, dto: RecordOrderPaymentDto) {
    const order = await this.findOne(id);
    const newPaidAmount = Number(order.paidAmount) + Number(dto.amount);
    const totalAmount = Number(order.totalAmount);

    let paymentStatus = dto.paymentStatus;
    if (!paymentStatus) {
      if (newPaidAmount >= totalAmount) {
        paymentStatus = 'PAID';
      } else if (newPaidAmount > 0) {
        paymentStatus = 'PARTIALLY_PAID';
      } else {
        paymentStatus = 'PENDING';
      }
    }

    return await prisma.customerOrder.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        paymentStatus: paymentStatus,
        ...(dto.paymentMethod && { paymentMethod: dto.paymentMethod }),
        ...(dto.notes && { notes: `${order.notes || ''}\n[Payment: ₹${dto.amount} - ${dto.notes}]`.trim() }),
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  /**
   * Record partial or full dispatch/delivery for customer order items
   */
  async recordDispatch(id: string, dto: RecordOrderDispatchDto, userId?: string) {
    const order = await this.findOne(id);

    return await prisma.$transaction(async (tx) => {
      const dispatchLogSummary: string[] = [];

      for (const itemDto of dto.items) {
        const lineItem = order.items.find((i) => i.id === itemDto.itemId);
        if (!lineItem) continue;

        const currentDelivered = Number(lineItem.deliveredQuantity || 0);
        const orderedQty = Number(lineItem.quantity || 0);
        const dispatchQty = Math.max(0, Number(itemDto.dispatchQuantity || 0));

        if (dispatchQty <= 0) continue;

        const newDelivered = Math.min(orderedQty, currentDelivered + dispatchQty);

        await tx.customerOrderItem.update({
          where: { id: itemDto.itemId },
          data: {
            deliveredQuantity: newDelivered,
          },
        });

        // Deduct finished goods stock and record inventory transaction
        if (lineItem.productId) {
          const product = await tx.rawMaterial.findUnique({
            where: { id: lineItem.productId },
          });

          if (product) {
            const currentStock = Number(product.currentStockBalance);
            const newStock = Math.max(0, currentStock - dispatchQty);

            await tx.rawMaterial.update({
              where: { id: lineItem.productId },
              data: { currentStockBalance: newStock },
            });

            if (userId) {
              await tx.inventoryTransaction.create({
                data: {
                  rawMaterialId: lineItem.productId,
                  transactionType: TransactionType.WORK_ORDER_ISSUE,
                  quantity: dispatchQty,
                  previousStock: currentStock,
                  newStock: newStock,
                  referenceNumber: order.orderNumber,
                  referenceDocumentType: 'CustomerOrder',
                  referenceDocumentId: order.id,
                  notes: `Customer order dispatch: ${order.orderNumber} - ${lineItem.itemName} (${dispatchQty} ${lineItem.uom})`,
                  createdByUserId: userId,
                },
              });
            }
          }
        }

        dispatchLogSummary.push(`${lineItem.itemName}: +${dispatchQty} ${lineItem.uom} (${newDelivered}/${orderedQty})`);
      }

      // Re-fetch all updated items to compute order fulfillment status
      const updatedItems = await tx.customerOrderItem.findMany({ where: { orderId: id } });

      let totalOrdered = 0;
      let totalDelivered = 0;
      let allItemsFullyDelivered = true;

      for (const it of updatedItems) {
        const oQty = Number(it.quantity);
        const dQty = Number(it.deliveredQuantity);
        totalOrdered += oQty;
        totalDelivered += dQty;
        if (dQty < oQty) {
          allItemsFullyDelivered = false;
        }
      }

      let newStatus = order.status;
      if (allItemsFullyDelivered && totalDelivered > 0) {
        newStatus = 'DISPATCHED';
      } else if (totalDelivered > 0) {
        newStatus = 'PARTIALLY_DISPATCHED';
      }

      const dispatchDate = dto.dispatchDate ? new Date(dto.dispatchDate) : new Date();

      const updatedOrder = await tx.customerOrder.update({
        where: { id },
        data: {
          status: newStatus,
          dispatchDate: dispatchDate,
          ...(dto.transportName && { transportName: dto.transportName }),
          ...(dto.transportMode && { transportMode: dto.transportMode }),
          ...(dto.trackingNumber && { trackingNumber: dto.trackingNumber }),
        },
        include: {
          customer: true,
          items: true,
          statusHistory: {
            orderBy: { changedAt: 'desc' },
            include: { changedByUser: { select: { id: true, email: true } } },
          },
        },
      });

      // Audit status change
      await tx.customerOrderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: newStatus,
          notes: `Dispatch Recorded (${newStatus}): ${dispatchLogSummary.join(' | ')}${dto.notes ? ` - ${dto.notes}` : ''}`,
          changedById: userId || null,
        },
      });

      return {
        ...updatedOrder,
        subtotal: Number(updatedOrder.subtotal),
        taxAmount: Number(updatedOrder.taxAmount),
        discountAmount: Number(updatedOrder.discountAmount),
        shippingCharges: Number(updatedOrder.shippingCharges),
        totalAmount: Number(updatedOrder.totalAmount),
        paidAmount: Number(updatedOrder.paidAmount),
        items: updatedOrder.items.map((i) => ({
          ...i,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          taxRate: Number(i.taxRate),
          taxAmount: Number(i.taxAmount),
          discount: Number(i.discount),
          totalPrice: Number(i.totalPrice),
          deliveredQuantity: Number(i.deliveredQuantity),
        })),
      };
    });
  }

  /**
   * Delete order
   */
  async remove(id: string) {
    await this.findOne(id);
    return await prisma.customerOrder.delete({ where: { id } });
  }
}
