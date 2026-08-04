import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, JobWorkStatus, TransactionType } from '@ims/database';
import { CreateJobWorkOrderDto } from './dto/create-job-work-order.dto';
import { IssueMaterialsDto } from './dto/issue-materials.dto';
import { ReceiveReturnDto } from './dto/receive-return.dto';
import { CloseJobWorkOrderDto } from './dto/close-job-work.dto';

@Injectable()
export class JobWorkService {
  /**
   * List all Job Work Orders with search, filtering, and pagination
   */
  async findAll(query: {
    search?: string;
    status?: JobWorkStatus;
    jobWorkCompanyId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.jobWorkCompanyId) {
      where.jobWorkCompanyId = query.jobWorkCompanyId;
    }

    if (query.search) {
      where.OR = [
        { jobWorkNumber: { contains: query.search, mode: 'insensitive' } },
        { challanNumber: { contains: query.search, mode: 'insensitive' } },
        { vehicleNumber: { contains: query.search, mode: 'insensitive' } },
        { driverName: { contains: query.search, mode: 'insensitive' } },
        { jobWorkCompany: { companyName: { contains: query.search, mode: 'insensitive' } } },
        { rawMaterial: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.jobWorkOrder.findMany({
        where,
        include: {
          jobWorkCompany: true,
          rawMaterial: true,
          finishedProduct: true,
          _count: {
            select: { issueItems: true, returnItems: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.jobWorkOrder.count({ where }),
    ]);

    // KPI Summary Metrics for main dashboard
    const [stats] = await Promise.all([
      prisma.jobWorkOrder.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const activeVendorsCount = await prisma.jobWorkCompany.count({ where: { isActive: true } });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalOrders: total,
        created: stats.find((s) => s.status === JobWorkStatus.CREATED)?._count.id || 0,
        materialsIssued: stats.find((s) => s.status === JobWorkStatus.MATERIALS_ISSUED)?._count.id || 0,
        inProgress: stats.find((s) => s.status === JobWorkStatus.IN_PROGRESS)?._count.id || 0,
        partialReturn: stats.find((s) => s.status === JobWorkStatus.PARTIAL_RETURN)?._count.id || 0,
        completed: stats.find((s) => s.status === JobWorkStatus.COMPLETED)?._count.id || 0,
        closed: stats.find((s) => s.status === JobWorkStatus.CLOSED)?._count.id || 0,
        activeVendorsCount,
      },
    };
  }

  /**
   * Get single Job Work Order details with items & status history
   */
  async findOne(id: string) {
    const order = await prisma.jobWorkOrder.findUnique({
      where: { id },
      include: {
        jobWorkCompany: true,
        rawMaterial: {
          include: { unit: true, category: true },
        },
        finishedProduct: {
          include: { unit: true },
        },
        closedByUser: {
          select: { id: true, email: true },
        },
        issueItems: {
          include: { batch: true },
          orderBy: { createdAt: 'asc' },
        },
        returnItems: {
          include: {
            finishedProduct: true,
            receivedByUser: { select: { id: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          include: {
            performedByUser: { select: { id: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Job Work Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Create a new Job Work Order (Status = CREATED)
   */
  async create(dto: CreateJobWorkOrderDto, userId?: string) {
    const company = await prisma.jobWorkCompany.findUnique({
      where: { id: dto.jobWorkCompanyId },
    });
    if (!company) {
      throw new BadRequestException('Invalid Job Working Company specified');
    }

    const rawMaterial = await prisma.rawMaterial.findUnique({
      where: { id: dto.rawMaterialId },
    });
    if (!rawMaterial) {
      throw new BadRequestException('Invalid Raw Material specified');
    }

    // Auto-generate Job Work Number e.g. JWO-2026-0042
    const count = await prisma.jobWorkOrder.count();
    const year = new Date().getFullYear();
    const jobWorkNumber = `JWO-${year}-${String(count + 1).padStart(4, '0')}`;

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.jobWorkOrder.create({
        data: {
          jobWorkNumber,
          jobWorkCompanyId: dto.jobWorkCompanyId,
          rawMaterialId: dto.rawMaterialId,
          finishedProductId: dto.finishedProductId || null,
          expectedReturnDate: new Date(dto.expectedReturnDate),
          remarks: dto.remarks,
          status: JobWorkStatus.CREATED,
        },
        include: {
          jobWorkCompany: true,
          rawMaterial: true,
        },
      });

      // Track timeline history
      await tx.jobWorkStatusHistory.create({
        data: {
          jobWorkOrderId: createdOrder.id,
          toStatus: JobWorkStatus.CREATED,
          notes: 'Job Work Order created in system',
          performedByUserId: userId || null,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: 'CREATE_JOB_WORK_ORDER',
          entityName: 'JobWorkOrder',
          entityId: createdOrder.id,
          newValues: createdOrder as any,
          userId: userId || null,
        },
      });

      return createdOrder;
    });

    return order;
  }

  /**
   * Issue Materials (Status -> MATERIALS_ISSUED, auto deduct stock, generate Challan)
   */
  async issueMaterials(id: string, dto: IssueMaterialsDto, userId?: string) {
    const order = await prisma.jobWorkOrder.findUnique({
      where: { id },
      include: { rawMaterial: true },
    });

    if (!order) {
      throw new NotFoundException(`Job Work Order ${id} not found`);
    }

    if (order.status !== JobWorkStatus.CREATED && order.status !== JobWorkStatus.MATERIALS_ISSUED) {
      throw new BadRequestException(`Cannot issue materials for an order in status ${order.status}`);
    }

    const totalWeight = dto.items.reduce((sum, item) => sum + item.issuedWeight, 0);
    const totalQty = dto.items.reduce((sum, item) => sum + item.issuedQty, 0);

    // Validate stock balance
    const stockBalance = Number(order.rawMaterial.currentStockBalance);
    if (stockBalance < totalQty) {
      throw new BadRequestException(
        `Insufficient stock for ${order.rawMaterial.name}. Available: ${stockBalance}, Requested: ${totalQty}`,
      );
    }

    // Auto-generate Challan Number
    const challanCount = await prisma.jobWorkOrder.count({
      where: { challanNumber: { not: null } },
    });
    const year = new Date().getFullYear();
    const challanNumber = dto.remarks?.includes('DC-')
      ? dto.remarks
      : `DC-${year}-${String(challanCount + 1).padStart(4, '0')}`;

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Deduct raw material stock
      await tx.rawMaterial.update({
        where: { id: order.rawMaterialId },
        data: {
          currentStockBalance: { decrement: totalQty },
        },
      });

      // 2. Create Inventory Transaction
      await tx.inventoryTransaction.create({
        data: {
          transactionType: TransactionType.JOB_WORK_DISPATCH,
          rawMaterialId: order.rawMaterialId,
          quantity: totalQty,
          referenceDocumentType: 'JobWorkOrder',
          referenceDocumentId: order.id,
          notes: `Dispatched to Job Working Company via Delivery Challan ${challanNumber}. Vehicle: ${dto.vehicleNumber}`,
          createdByUserId: userId || (await tx.user.findFirstOrThrow()).id,
        },
      });

      // 3. Create issue items
      await tx.jobWorkIssueItem.createMany({
        data: dto.items.map((item) => ({
          jobWorkOrderId: order.id,
          rollNumber: item.rollNumber,
          batchId: item.batchId || null,
          issuedWeight: item.issuedWeight,
          issuedQty: item.issuedQty,
          remarks: item.remarks || null,
        })),
      });

      // 4. Update Job Work Order status and totals
      const newTotalIssuedWeight = Number(order.totalIssuedWeight) + totalWeight;
      const newTotalIssuedQty = Number(order.totalIssuedQty) + totalQty;

      const orderUpdated = await tx.jobWorkOrder.update({
        where: { id },
        data: {
          challanNumber,
          vehicleNumber: dto.vehicleNumber,
          driverName: dto.driverName,
          totalIssuedWeight: newTotalIssuedWeight,
          totalIssuedQty: newTotalIssuedQty,
          pendingWeight: newTotalIssuedWeight - Number(order.totalReturnedWeight) - Number(order.totalWastageWeight),
          pendingQty: newTotalIssuedQty - Number(order.totalReturnedQty) - Number(order.totalWastageQty),
          status: JobWorkStatus.MATERIALS_ISSUED,
          remarks: dto.remarks || order.remarks,
        },
        include: {
          jobWorkCompany: true,
          rawMaterial: true,
          issueItems: true,
        },
      });

      // 5. Track timeline history
      await tx.jobWorkStatusHistory.create({
        data: {
          jobWorkOrderId: order.id,
          fromStatus: order.status,
          toStatus: JobWorkStatus.MATERIALS_ISSUED,
          notes: `Issued ${dto.items.length} roll(s) weighing ${totalWeight} kg. Delivery Challan ${challanNumber} generated. Vehicle: ${dto.vehicleNumber}`,
          performedByUserId: userId || null,
        },
      });

      // 6. Audit log
      await tx.auditLog.create({
        data: {
          action: 'ISSUE_JOB_WORK_MATERIALS',
          entityName: 'JobWorkOrder',
          entityId: order.id,
          newValues: { challanNumber, totalWeight, totalQty, vehicleNumber: dto.vehicleNumber } as any,
          userId: userId || null,
        },
      });

      return orderUpdated;
    });

    return updatedOrder;
  }

  /**
   * Receive Returned Goods (Digital Return Register, auto increase finished stock)
   */
  async receiveReturn(id: string, dto: ReceiveReturnDto, userId?: string) {
    const order = await prisma.jobWorkOrder.findUnique({
      where: { id },
      include: { rawMaterial: true, finishedProduct: true },
    });

    if (!order) {
      throw new NotFoundException(`Job Work Order ${id} not found`);
    }

    if (
      order.status !== JobWorkStatus.MATERIALS_ISSUED &&
      order.status !== JobWorkStatus.IN_PROGRESS &&
      order.status !== JobWorkStatus.PARTIAL_RETURN
    ) {
      throw new BadRequestException(`Cannot receive returns for order in status ${order.status}`);
    }

    const batchReturnedWeight = dto.items.reduce((sum, i) => sum + i.returnedWeight, 0);
    const batchReturnedQty = dto.items.reduce((sum, i) => sum + i.returnedQty, 0);
    const batchWastageWeight = dto.items.reduce((sum, i) => sum + (i.wastageWeight || 0), 0);
    const batchWastageQty = dto.items.reduce((sum, i) => sum + (i.wastageQty || 0), 0);

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Record return items
      for (const item of dto.items) {
        await tx.jobWorkReturnItem.create({
          data: {
            jobWorkOrderId: order.id,
            returnedDate: new Date(dto.returnedDate),
            rollNumber: item.rollNumber,
            finishedProductId: item.finishedProductId,
            returnedWeight: item.returnedWeight,
            returnedQty: item.returnedQty,
            wastageWeight: item.wastageWeight || 0,
            wastageQty: item.wastageQty || 0,
            photoUrls: item.photoUrls || [],
            remarks: item.remarks || null,
            receivedByUserId: userId || null,
          },
        });

        // 2. Increase stock balance for returned product
        await tx.rawMaterial.update({
          where: { id: item.finishedProductId },
          data: {
            currentStockBalance: { increment: item.returnedQty },
          },
        });

        // 3. Log inventory transaction for returned finished product
        await tx.inventoryTransaction.create({
          data: {
            transactionType: TransactionType.JOB_WORK_RETURN,
            rawMaterialId: item.finishedProductId,
            quantity: item.returnedQty,
            referenceDocumentType: 'JobWorkOrder',
            referenceDocumentId: order.id,
            notes: `Received from Job Working Company. Roll: ${item.rollNumber}, Weight: ${item.returnedWeight} kg`,
            createdByUserId: userId || (await tx.user.findFirstOrThrow()).id,
          },
        });
      }

      // Calculate new order cumulative totals
      const totalReturnedWeight = Number(order.totalReturnedWeight) + batchReturnedWeight;
      const totalReturnedQty = Number(order.totalReturnedQty) + batchReturnedQty;
      const totalWastageWeight = Number(order.totalWastageWeight) + batchWastageWeight;
      const totalWastageQty = Number(order.totalWastageQty) + batchWastageQty;

      const totalIssuedWeight = Number(order.totalIssuedWeight);
      const totalIssuedQty = Number(order.totalIssuedQty);

      const pendingWeight = Math.max(0, totalIssuedWeight - totalReturnedWeight - totalWastageWeight);
      const pendingQty = Math.max(0, totalIssuedQty - totalReturnedQty - totalWastageQty);

      // Determine order status
      const nextStatus = pendingWeight <= 0.001 ? JobWorkStatus.COMPLETED : JobWorkStatus.PARTIAL_RETURN;

      const orderUpdated = await tx.jobWorkOrder.update({
        where: { id },
        data: {
          totalReturnedWeight,
          totalReturnedQty,
          totalWastageWeight,
          totalWastageQty,
          pendingWeight,
          pendingQty,
          status: nextStatus,
        },
        include: {
          jobWorkCompany: true,
          returnItems: true,
        },
      });

      // Track timeline history
      await tx.jobWorkStatusHistory.create({
        data: {
          jobWorkOrderId: order.id,
          fromStatus: order.status,
          toStatus: nextStatus,
          notes: `Received ${dto.items.length} returned roll(s) weighing ${batchReturnedWeight} kg (Scrap: ${batchWastageWeight} kg). Pending: ${pendingWeight} kg`,
          performedByUserId: userId || null,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: 'RECEIVE_JOB_WORK_RETURN',
          entityName: 'JobWorkOrder',
          entityId: order.id,
          newValues: { batchReturnedWeight, batchReturnedQty, nextStatus } as any,
          userId: userId || null,
        },
      });

      return orderUpdated;
    });

    return updatedOrder;
  }

  /**
   * Close Job Work Order (Status = CLOSED)
   */
  async closeOrder(id: string, dto: CloseJobWorkOrderDto, userId?: string) {
    const order = await prisma.jobWorkOrder.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Job Work Order ${id} not found`);
    }

    if (order.status === JobWorkStatus.CLOSED) {
      throw new BadRequestException(`Order ${order.jobWorkNumber} is already closed`);
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const orderClosed = await tx.jobWorkOrder.update({
        where: { id },
        data: {
          status: JobWorkStatus.CLOSED,
          closedAt: new Date(),
          closedByUserId: userId || null,
          remarks: dto.remarks ? `${order.remarks || ''}\nClosing Note: ${dto.remarks}` : order.remarks,
        },
      });

      await tx.jobWorkStatusHistory.create({
        data: {
          jobWorkOrderId: order.id,
          fromStatus: order.status,
          toStatus: JobWorkStatus.CLOSED,
          notes: dto.remarks || 'Work Order reconciled and closed',
          performedByUserId: userId || null,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'CLOSE_JOB_WORK_ORDER',
          entityName: 'JobWorkOrder',
          entityId: order.id,
          newValues: { status: JobWorkStatus.CLOSED, remarks: dto.remarks } as any,
          userId: userId || null,
        },
      });

      return orderClosed;
    });

    return updatedOrder;
  }

  /**
   * Get Return Register Feed across all vendors
   */
  async getReturnRegister(query: { search?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        { rollNumber: { contains: query.search, mode: 'insensitive' } },
        { jobWorkOrder: { jobWorkNumber: { contains: query.search, mode: 'insensitive' } } },
        { jobWorkOrder: { jobWorkCompany: { companyName: { contains: query.search, mode: 'insensitive' } } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.jobWorkReturnItem.findMany({
        where,
        include: {
          finishedProduct: true,
          jobWorkOrder: {
            include: { jobWorkCompany: true },
          },
          receivedByUser: { select: { email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.jobWorkReturnItem.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Helper: Get companies for select drop-downs
   */
  async getCompanies() {
    return prisma.jobWorkCompany.findMany({
      where: { isActive: true },
      orderBy: { companyName: 'asc' },
    });
  }

  /**
   * Helper: Get materials for select drop-downs
   */
  async getMaterials() {
    return prisma.rawMaterial.findMany({
      where: { isActive: true },
      include: { unit: true },
      orderBy: { name: 'asc' },
    });
  }
}
