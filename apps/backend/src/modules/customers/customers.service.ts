import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { prisma, Prisma } from '@ims/database';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  /**
   * Helper to generate unique Customer Code (e.g. CUST-001)
   */
  async generateCustomerCode(): Promise<string> {
    const count = await prisma.customer.count();
    const seq = String(count + 1).padStart(3, '0');
    let code = `CUST-${seq}`;
    let exists = await prisma.customer.findUnique({ where: { code } });
    let counter = count + 1;
    while (exists) {
      counter++;
      code = `CUST-${String(counter).padStart(3, '0')}`;
      exists = await prisma.customer.findUnique({ where: { code } });
    }
    return code;
  }

  /**
   * List all customers with search, customerType, status filters and order stats
   */
  async findAll(query: {
    search?: string;
    customerType?: string;
    isActive?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (query.customerType) {
      where.customerType = query.customerType;
    }

    if (query.isActive !== undefined && query.isActive !== '') {
      where.isActive = query.isActive === 'true';
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { contactPerson: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { gstin: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: { orders: true },
          },
          orders: {
            select: {
              totalAmount: true,
              status: true,
              paymentStatus: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    // Compute aggregated metrics per customer
    const formatted = items.map((c) => {
      const totalOrderValue = c.orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      const pendingOrdersCount = c.orders.filter(
        (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
      ).length;

      const { orders, ...rest } = c;
      return {
        ...rest,
        creditLimit: Number(c.creditLimit || 0),
        totalOrderValue,
        pendingOrdersCount,
      };
    });

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
   * Get KPI Summary Statistics for Customers Directory
   */
  async getStats() {
    const [totalCustomers, activeCustomers, allOrders] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.customerOrder.findMany({
        select: { totalAmount: true, status: true, paymentStatus: true },
      }),
    ]);

    let totalRevenue = 0;
    let pendingFulfillmentCount = 0;

    allOrders.forEach((o) => {
      totalRevenue += Number(o.totalAmount || 0);
      if (o.status !== 'DELIVERED' && o.status !== 'CANCELLED') {
        pendingFulfillmentCount++;
      }
    });

    return {
      totalCustomers,
      activeCustomers,
      totalOrdersCount: allOrders.length,
      totalRevenue,
      pendingFulfillmentCount,
    };
  }

  /**
   * Get single customer with detailed order history
   */
  async findOne(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            items: true,
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found.`);
    }

    const totalOrderValue = customer.orders.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0
    );

    return {
      ...customer,
      creditLimit: Number(customer.creditLimit || 0),
      totalOrderValue,
    };
  }

  /**
   * Create a new customer master
   */
  async create(dto: CreateCustomerDto) {
    let code = dto.code;
    if (!code || code.trim() === '') {
      code = await this.generateCustomerCode();
    } else {
      const exists = await prisma.customer.findUnique({ where: { code } });
      if (exists) {
        throw new ConflictException(`Customer code "${code}" already exists.`);
      }
    }

    return await prisma.customer.create({
      data: {
        code,
        name: dto.name,
        contactPerson: dto.contactPerson || null,
        email: dto.email || null,
        phone: dto.phone || null,
        alternatePhone: dto.alternatePhone || null,
        gstin: dto.gstin || null,
        panNo: dto.panNo || null,
        dlNo: dto.dlNo || null,
        regdNo: dto.regdNo || null,
        transportName: dto.transportName || null,
        address: dto.address || null,
        shippingAddress: dto.shippingAddress || null,
        city: dto.city || null,
        state: dto.state || null,
        pinCode: dto.pinCode || null,
        creditLimit: dto.creditLimit || 0,
        creditDays: dto.creditDays || 30,
        paymentTerms: dto.paymentTerms || 'Net 30',
        customerType: dto.customerType || 'HOSPITAL',
        isActive: dto.isActive ?? true,
        notes: dto.notes || null,
      },
    });
  }

  /**
   * Update customer master record
   */
  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.findOne(id);

    if (dto.code && dto.code !== customer.code) {
      const exists = await prisma.customer.findUnique({ where: { code: dto.code } });
      if (exists) {
        throw new ConflictException(`Customer code "${dto.code}" already exists.`);
      }
    }

    return await prisma.customer.update({
      where: { id },
      data: {
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.contactPerson !== undefined && { contactPerson: dto.contactPerson }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.alternatePhone !== undefined && { alternatePhone: dto.alternatePhone }),
        ...(dto.gstin !== undefined && { gstin: dto.gstin }),
        ...(dto.panNo !== undefined && { panNo: dto.panNo }),
        ...(dto.dlNo !== undefined && { dlNo: dto.dlNo }),
        ...(dto.regdNo !== undefined && { regdNo: dto.regdNo }),
        ...(dto.transportName !== undefined && { transportName: dto.transportName }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.shippingAddress !== undefined && { shippingAddress: dto.shippingAddress }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.pinCode !== undefined && { pinCode: dto.pinCode }),
        ...(dto.creditLimit !== undefined && { creditLimit: dto.creditLimit }),
        ...(dto.creditDays !== undefined && { creditDays: dto.creditDays }),
        ...(dto.paymentTerms !== undefined && { paymentTerms: dto.paymentTerms }),
        ...(dto.customerType !== undefined && { customerType: dto.customerType }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  /**
   * Delete or deactivate customer
   */
  async remove(id: string) {
    const customer = await this.findOne(id);

    if (customer._count.orders > 0) {
      // Soft-deactivate if linked to orders
      return await prisma.customer.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return await prisma.customer.delete({
      where: { id },
    });
  }
}
