import { Injectable, NotFoundException } from '@nestjs/common';
import {
  prisma,
  NotificationType,
  NotificationSeverity,
  JobWorkStatus,
  PayrollStatus,
  Prisma,
} from '@ims/database';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  /**
   * List notifications with filters, search, and pagination
   */
  async findAll(query: {
    type?: NotificationType;
    severity?: NotificationSeverity;
    isRead?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    userId?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {};

    if (query.userId) {
      where.OR = [{ userId: query.userId }, { userId: null }];
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.severity) {
      where.severity = query.severity;
    }
    if (typeof query.isRead === 'boolean') {
      where.isRead = query.isRead;
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { message: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          ...(query.userId ? { OR: [{ userId: query.userId }, { userId: null }] } : {}),
          isRead: false,
        },
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        unreadCount,
      },
    };
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId?: string) {
    const unreadCount = await prisma.notification.count({
      where: {
        ...(userId ? { OR: [{ userId }, { userId: null }] } : {}),
        isRead: false,
      },
    });
    return { unreadCount };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string) {
    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId?: string) {
    const where: Prisma.NotificationWhereInput = { isRead: false };
    if (userId) {
      where.OR = [{ userId }, { userId: null }];
    }

    const result = await prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read', count: result.count };
  }

  /**
   * Create a manual or trigger-based notification
   */
  async create(dto: CreateNotificationDto) {
    return await prisma.notification.create({
      data: {
        title: dto.title,
        message: dto.message,
        type: dto.type || NotificationType.SYSTEM,
        severity: dto.severity || NotificationSeverity.INFO,
        link: dto.link || null,
        userId: dto.userId || null,
      },
    });
  }

  /**
   * Delete a notification
   */
  async remove(id: string) {
    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    await prisma.notification.delete({ where: { id } });
    return { message: 'Notification deleted successfully' };
  }

  /**
   * Rule Engine: Automatically scans operational database state and creates system alerts
   */
  async generateSystemAlerts() {
    let createdCount = 0;

    // 1. Scan Low Stock Raw Materials
    const materials = await prisma.rawMaterial.findMany({
      where: { isActive: true },
      include: { unit: true },
    });

    for (const mat of materials) {
      const current = Number(mat.currentStockBalance);
      const min = Number(mat.minimumStockLevel);

      if (current <= min) {
        const isZero = current <= 0;
        const title = isZero
          ? `Out of Stock: ${mat.sku}`
          : `Low Stock Warning: ${mat.sku}`;
        const message = isZero
          ? `${mat.name} is completely out of stock (0 ${mat.unit?.abbreviation || 'Units'}). Immediate purchase order required.`
          : `${mat.name} has fallen below minimum safety level. Current: ${current.toFixed(1)} ${mat.unit?.abbreviation || 'Units'}, Safety Min: ${min}.`;

        const existingUnread = await prisma.notification.findFirst({
          where: {
            title,
            isRead: false,
          },
        });

        if (!existingUnread) {
          await prisma.notification.create({
            data: {
              title,
              message,
              type: NotificationType.STOCK_ALERT,
              severity: isZero ? NotificationSeverity.ERROR : NotificationSeverity.WARNING,
              link: `/raw-materials/${mat.id}`,
            },
          });
          createdCount++;
        }
      }
    }

    // 2. Scan Job Work Subcontracting Orders in Progress / Due
    const activeJobWorks = await prisma.jobWorkOrder.findMany({
      where: {
        status: { in: [JobWorkStatus.IN_PROGRESS, JobWorkStatus.MATERIALS_ISSUED] },
      },
      include: { jobWorkCompany: true },
    });

    for (const jw of activeJobWorks) {
      const title = `Active Job Work: ${jw.jobWorkNumber}`;
      const message = `Challan ${jw.challanNumber || jw.jobWorkNumber} with ${jw.jobWorkCompany?.companyName || 'Subcontractor'} is in progress (${jw.pendingWeight} Kg pending return).`;

      const existing = await prisma.notification.findFirst({
        where: { title, isRead: false },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            title,
            message,
            type: NotificationType.JOB_WORK,
            severity: NotificationSeverity.INFO,
            link: `/job-work/${jw.id}`,
          },
        });
        createdCount++;
      }
    }

    // 3. Scan Pending Payroll Approvals
    const pendingPayrolls = await prisma.payrollRun.findMany({
      where: { status: PayrollStatus.PENDING_APPROVAL },
    });

    for (const pr of pendingPayrolls) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthStr = `${monthNames[(pr.month || 1) - 1]} ${pr.year}`;
      const title = `Payroll Pending Approval: ${monthStr}`;
      const message = `Monthly payroll run for ${monthStr} totaling ₹${Number(pr.totalNet || 0).toLocaleString('en-IN')} is awaiting executive sign-off.`;

      const existing = await prisma.notification.findFirst({
        where: { title, isRead: false },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            title,
            message,
            type: NotificationType.PAYROLL,
            severity: NotificationSeverity.WARNING,
            link: `/salary/approval`,
          },
        });
        createdCount++;
      }
    }

    // 4. Scan Active Production Batches
    const gauzeBatches = await prisma.gauzeProductionBatch.findMany({
      where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
      take: 3,
    });

    for (const gb of gauzeBatches) {
      const title = `Gauze Batch Active: ${gb.batchNumber}`;
      const message = `Batch ${gb.batchNumber} is currently in stage: ${gb.currentStage} (${gb.currentQuantity} ${gb.currentUom}).`;

      const existing = await prisma.notification.findFirst({
        where: { title, isRead: false },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            title,
            message,
            type: NotificationType.PRODUCTION,
            severity: NotificationSeverity.INFO,
            link: `/gauze-production/batches/${gb.id}`,
          },
        });
        createdCount++;
      }
    }

    return { message: 'System alerts sync completed', alertsGenerated: createdCount };
  }
}
