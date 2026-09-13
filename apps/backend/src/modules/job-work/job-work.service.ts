import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, JobWorkStatus, TransactionType } from '@ims/database';
import { CreateJobWorkOrderDto } from './dto/create-job-work-order.dto';
import { UpdateJobWorkOrderDto } from './dto/update-job-work-order.dto';
import { IssueMaterialsDto } from './dto/issue-materials.dto';
import { ReceiveReturnDto } from './dto/receive-return.dto';
import { CloseJobWorkOrderDto } from './dto/close-job-work.dto';
import { CreateWeavingJobWorkDto } from './dto/create-weaving-job-work.dto';
import { ReceiveWeavingReturnDto } from './dto/receive-weaving-return.dto';

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
          weavingDetail: true,
          weavingReceivedItems: true,
          _count: {
            select: { issueItems: true, returnItems: true, weavingReceivedItems: true },
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
        weavingDetail: true,
        weavingReceivedItems: {
          include: {
            receivedByUser: { select: { id: true, email: true } },
          },
          orderBy: { date: 'desc' },
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
   * Create a new Weaving Job Work Order with calculations & mark breakdown
   */
  async createWeavingOrder(dto: CreateWeavingJobWorkDto, userId?: string) {
    const company = await prisma.jobWorkCompany.findUnique({
      where: { id: dto.jobWorkCompanyId },
    });
    if (!company) {
      throw new BadRequestException('Invalid Job Working Company specified');
    }

    if (dto.rawMaterialId) {
      const rawMat = await prisma.rawMaterial.findUnique({
        where: { id: dto.rawMaterialId },
      });
      if (!rawMat) {
        throw new BadRequestException('Invalid Raw Material specified');
      }
    }

    // Auto-generate Job Work Number e.g. JWO-2026-0042
    const count = await prisma.jobWorkOrder.count();
    const year = new Date().getFullYear();
    const jobWorkNumber = `JWO-${year}-${String(count + 1).padStart(4, '0')}`;

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.jobWorkOrder.create({
        data: {
          jobWorkNumber,
          jobWorkType: 'WEAVING',
          jobWorkCompanyId: dto.jobWorkCompanyId,
          rawMaterialId: dto.rawMaterialId || null,
          expectedReturnDate: new Date(dto.expectedReturnDate),
          totalIssuedWeight: dto.totalReceivableWeightKg,
          totalIssuedQty: dto.totalPieces,
          pendingWeight: dto.totalReceivableWeightKg,
          pendingQty: dto.totalPieces,
          remarks: dto.remarks,
          status: JobWorkStatus.CREATED,
        },
      });

      // Create WeavingJobWorkDetail
      const weavingDetail = await tx.weavingJobWorkDetail.create({
        data: {
          jobWorkOrderId: createdOrder.id,
          ends: dto.ends,
          reed: dto.reed,
          pick: dto.pick,
          totalPaavu: dto.totalPaavu,
          pieceLengthYards: dto.pieceLengthYards ?? 112,
          pieceLengthMeters: dto.pieceLengthMeters ?? 100,
          weftCount: dto.weftCount,
          warpCount: dto.warpCount || null,
          yarnConstant: dto.yarnConstant ?? 0.54,
          markBreakdown: dto.markBreakdown as any,
          totalPieces: dto.totalPieces,
          weftWeightPerPieceKg: dto.weftWeightPerPieceKg,
          totalWeftWeightKg: dto.totalWeftWeightKg,
          warpWeightKg: dto.warpWeightKg ?? 0,
          totalReceivableWeightKg: dto.totalReceivableWeightKg,
          salaryType: dto.salaryType || 'Roll',
          ratePerMeter: dto.ratePerMeter,
          baseReedPicks: dto.baseReedPicks ?? 16,
          salaryPerPiece: dto.salaryPerPiece,
          totalSalary: dto.totalSalary,
        },
      });

      // Track timeline history
      await tx.jobWorkStatusHistory.create({
        data: {
          jobWorkOrderId: createdOrder.id,
          toStatus: JobWorkStatus.CREATED,
          notes: `Weaving Job Work Order created: ${dto.totalPieces} pcs (${dto.totalPaavu} Paavu), Weft: ${dto.totalWeftWeightKg} kg, Salary: ₹${Number(dto.totalSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${dto.salaryType} @ ₹${dto.ratePerMeter}/m)`,
          performedByUserId: userId || null,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: 'CREATE_WEAVING_JOB_WORK_ORDER',
          entityName: 'JobWorkOrder',
          entityId: createdOrder.id,
          newValues: { ...createdOrder, weavingDetail } as any,
          userId: userId || null,
        },
      });

      return {
        ...createdOrder,
        weavingDetail,
        jobWorkCompany: company,
      };
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

    const totalWeight = dto.items.reduce((sum, item) => sum + Number(item.issuedWeight || 0), 0);
    const totalQty = dto.items.reduce((sum, item) => sum + Number(item.issuedQty || 0), 0);

    if (!order.rawMaterial || !order.rawMaterialId) {
      throw new BadRequestException('No raw material is designated for this job work order to issue');
    }

    const rawMaterialId = order.rawMaterialId;
    const rawMaterialName = order.rawMaterial.name;
    const stockBalance = Number(order.rawMaterial.currentStockBalance);
    if (stockBalance < totalWeight) {
      throw new BadRequestException(
        `Insufficient stock for ${rawMaterialName}. Available: ${stockBalance.toFixed(2)} Kg, Requested: ${totalWeight.toFixed(2)} Kg`,
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
      // 1. Deduct raw material stock in Kg
      const rawMat = await tx.rawMaterial.findUniqueOrThrow({
        where: { id: rawMaterialId },
      });
      const prevStock = Number(rawMat.currentStockBalance);
      const newStock = Math.max(0, prevStock - totalWeight);

      await tx.rawMaterial.update({
        where: { id: rawMaterialId },
        data: {
          currentStockBalance: newStock,
        },
      });

      // 2. Create Inventory Transaction with accurate stock balances in Kg
      await tx.inventoryTransaction.create({
        data: {
          transactionType: TransactionType.JOB_WORK_DISPATCH,
          rawMaterialId: rawMaterialId,
          quantity: totalWeight,
          previousStock: prevStock,
          newStock: newStock,
          referenceNumber: challanNumber,
          referenceDocumentType: 'JobWorkOrder',
          referenceDocumentId: order.id,
          notes: `Dispatched to Job Working Company via Delivery Challan ${challanNumber}. Total: ${totalWeight.toFixed(2)} Kg (${totalQty} Rolls). Vehicle: ${dto.vehicleNumber || 'N/A'}`,
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

        // 2. Increase stock balance for returned product (aware of discrete UOM vs continuous weight)
        const itemReturnedWeight = Number(item.returnedWeight) || 0;
        const finProd = await tx.rawMaterial.findUniqueOrThrow({
          where: { id: item.finishedProductId },
          include: { unit: true },
        });

        const unitAbbr = finProd.unit?.abbreviation?.toLowerCase() || '';
        const unitName = finProd.unit?.name?.toLowerCase() || '';

        // Check if the finished product is discrete (Pieces, Units, Boxes, Packs)
        const isDiscreteUnit =
          unitAbbr === 'pc' ||
          unitAbbr === 'pcs' ||
          unitAbbr === 'nos' ||
          unitAbbr === 'box' ||
          unitAbbr === 'pk' ||
          unitAbbr === 'pkt' ||
          unitAbbr === 'dzn' ||
          unitName.includes('piece') ||
          unitName.includes('unit') ||
          unitName.includes('pack') ||
          unitName.includes('box') ||
          unitName.includes('dozen');

        const prevStock = Number(finProd.currentStockBalance);
        // Discrete goods increment by piece count (e.g. +500 Pcs), continuous goods increment by weight (e.g. +95 Kg)
        const stockIncrement = isDiscreteUnit ? Number(item.returnedQty || 1) : itemReturnedWeight;
        const newStock = prevStock + stockIncrement;
        const displayUnit = finProd.unit?.abbreviation || (isDiscreteUnit ? 'Pcs' : 'Kg');

        await tx.rawMaterial.update({
          where: { id: item.finishedProductId },
          data: {
            currentStockBalance: newStock,
          },
        });

        // 3. Log inventory transaction for returned finished product in native unit + fabric weight reference
        await tx.inventoryTransaction.create({
          data: {
            transactionType: TransactionType.JOB_WORK_RETURN,
            rawMaterialId: item.finishedProductId,
            quantity: stockIncrement,
            previousStock: prevStock,
            newStock: newStock,
            referenceNumber: order.jobWorkNumber,
            referenceDocumentType: 'JobWorkOrder',
            referenceDocumentId: order.id,
            notes: `Received from Job Work. Lot/Roll: ${item.rollNumber}, Stock: +${stockIncrement} ${displayUnit}, Batch Material Weight: ${itemReturnedWeight.toFixed(2)} Kg`,
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
      const isComplete = Boolean(dto.isFinal) || pendingWeight <= 0.001;
      const nextStatus = isComplete ? JobWorkStatus.COMPLETED : JobWorkStatus.PARTIAL_RETURN;
      const finalPendingWeight = isComplete ? 0 : pendingWeight;
      const finalPendingQty = isComplete ? 0 : pendingQty;

      // If marked final with remaining difference, absorb difference into total wastage weight
      const extraWastage = (dto.isFinal && pendingWeight > 0.001) ? pendingWeight : 0;
      const finalTotalWastageWeight = totalWastageWeight + extraWastage;

      const updatedRemarks = dto.remarks?.trim()
        ? (order.remarks ? `${order.remarks}\n[${isComplete ? 'Final Return & Wastage' : 'Return Log'}]: ${dto.remarks.trim()}` : dto.remarks.trim())
        : order.remarks;

      const orderUpdated = await tx.jobWorkOrder.update({
        where: { id },
        data: {
          totalReturnedWeight,
          totalReturnedQty,
          totalWastageWeight: finalTotalWastageWeight,
          totalWastageQty,
          pendingWeight: finalPendingWeight,
          pendingQty: finalPendingQty,
          status: nextStatus,
          remarks: updatedRemarks,
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
          notes: dto.remarks?.trim()
            ? `${isComplete ? 'FINAL RETURN (Order Completed): ' : ''}Received ${dto.items.length} roll(s) (${batchReturnedWeight.toFixed(2)} kg). ${dto.remarks.trim()}`
            : `Received ${dto.items.length} returned roll(s) weighing ${batchReturnedWeight} kg (Scrap: ${batchWastageWeight} kg). Pending: ${finalPendingWeight} kg`,
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
   * Receive Weaving In-Pass Returned Goods
   * CRITICAL: Stores goods directly in WeavingReceivedItem table
   * STRICTLY BYPASSES raw_materials inventory table and inventory_transactions
   */
  async receiveWeavingReturn(id: string, dto: ReceiveWeavingReturnDto, userId?: string) {
    const order = await prisma.jobWorkOrder.findUnique({
      where: { id },
      include: {
        weavingDetail: true,
        weavingReceivedItems: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Job Work Order with ID ${id} not found`);
    }

    if (order.jobWorkType !== 'WEAVING') {
      throw new BadRequestException('Order is not a Weaving Job Work Order');
    }

    if (
      order.status !== JobWorkStatus.CREATED &&
      order.status !== JobWorkStatus.MATERIALS_ISSUED &&
      order.status !== JobWorkStatus.IN_PROGRESS &&
      order.status !== JobWorkStatus.PARTIAL_RETURN
    ) {
      throw new BadRequestException(`Cannot receive returns for order in status ${order.status}`);
    }

    const batchReturnedWeight = dto.items.reduce((sum, i) => sum + Number(i.weightKg || 0), 0);
    const batchWastageWeight = dto.items.reduce((sum, i) => sum + Number(i.wastageWeightKg || 0), 0);

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Create In-Pass records in WeavingReceivedItem table
      // (STRICTLY NO raw_materials update or inventoryTransaction creation!)
      for (const item of dto.items) {
        await tx.weavingReceivedItem.create({
          data: {
            jobWorkOrderId: order.id,
            date: new Date(item.date),
            inPassNumber: item.inPassNumber,
            description: item.description,
            weightKg: item.weightKg,
            wastageDescription: item.wastageDescription || null,
            wastageWeightKg: item.wastageWeightKg || 0,
            receivedByUserId: userId || null,
          },
        });
      }

      // 2. Cumulative calculation
      const totalReturnedWeight = Number(order.totalReturnedWeight) + batchReturnedWeight;
      const totalWastageWeight = Number(order.totalWastageWeight) + batchWastageWeight;

      const expectedWeight = order.weavingDetail
        ? Number(order.weavingDetail.totalReceivableWeightKg)
        : Number(order.totalIssuedWeight);

      const pendingWeight = Math.max(0, expectedWeight - totalReturnedWeight - totalWastageWeight);

      // Determine order status
      let nextStatus: JobWorkStatus;
      if (dto.isFinal || pendingWeight <= 0.001) {
        nextStatus = JobWorkStatus.COMPLETED;
      } else {
        nextStatus = JobWorkStatus.PARTIAL_RETURN;
      }

      const orderUpdated = await tx.jobWorkOrder.update({
        where: { id: order.id },
        data: {
          totalReturnedWeight,
          totalWastageWeight,
          pendingWeight,
          status: nextStatus,
          remarks: dto.remarks
            ? order.remarks
              ? `${order.remarks}\n${dto.remarks}`
              : dto.remarks
            : order.remarks,
        },
        include: {
          jobWorkCompany: true,
          weavingDetail: true,
          weavingReceivedItems: {
            include: {
              receivedByUser: { select: { id: true, email: true } },
            },
            orderBy: { date: 'desc' },
          },
        },
      });

      // 3. Track timeline history
      const inPassNumbers = dto.items.map((i) => i.inPassNumber).join(', ');
      await tx.jobWorkStatusHistory.create({
        data: {
          jobWorkOrderId: order.id,
          fromStatus: order.status,
          toStatus: nextStatus,
          notes: `Received In-Pass Weaving Return: ${dto.items.length} item(s) weighing ${batchReturnedWeight.toFixed(2)} kg (Wastage: ${batchWastageWeight.toFixed(2)} kg). In-Pass: ${inPassNumbers}. Recorded in Weaving In-Pass Register.`,
          performedByUserId: userId || null,
        },
      });

      // 4. Audit log
      await tx.auditLog.create({
        data: {
          action: 'RECEIVE_WEAVING_IN_PASS_RETURN',
          entityName: 'JobWorkOrder',
          entityId: order.id,
          newValues: {
            inPassNumbers,
            batchReturnedWeight,
            batchWastageWeight,
            totalReturnedWeight,
            totalWastageWeight,
            pendingWeight,
            nextStatus,
          } as any,
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
   * Helper: Get companies for select drop-downs and vendor management
   */
  async getCompanies(includeInactive = true) {
    return prisma.jobWorkCompany.findMany({
      where: includeInactive ? undefined : { isActive: true },
      include: {
        _count: {
          select: {
            jobWorkOrders: true,
            jobWorkChallans: true,
            cottonRolls: true,
            gauzeBleachingJobs: true,
          },
        },
      },
      orderBy: { companyName: 'asc' },
    });
  }

  async createCompany(data: {
    companyName: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    gstin?: string;
    address?: string;
    creditDays?: number;
  }) {
    return prisma.jobWorkCompany.create({
      data: {
        companyName: data.companyName,
        contactPerson: data.contactPerson || null,
        phone: data.phone || null,
        email: data.email || null,
        gstin: data.gstin || null,
        address: data.address || null,
        creditDays: data.creditDays ? Number(data.creditDays) : 30,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            jobWorkOrders: true,
            jobWorkChallans: true,
            cottonRolls: true,
            gauzeBleachingJobs: true,
          },
        },
      },
    });
  }

  async updateCompany(
    id: string,
    data: {
      companyName?: string;
      contactPerson?: string;
      phone?: string;
      email?: string;
      gstin?: string;
      address?: string;
      creditDays?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.jobWorkCompany.update({
      where: { id },
      data: {
        ...(data.companyName ? { companyName: data.companyName } : {}),
        ...(data.contactPerson !== undefined ? { contactPerson: data.contactPerson } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.gstin !== undefined ? { gstin: data.gstin } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.creditDays !== undefined ? { creditDays: Number(data.creditDays) } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
      include: {
        _count: {
          select: {
            jobWorkOrders: true,
            jobWorkChallans: true,
            cottonRolls: true,
            gauzeBleachingJobs: true,
          },
        },
      },
    });
  }

  async deleteCompany(id: string) {
    try {
      return await prisma.jobWorkCompany.delete({
        where: { id },
      });
    } catch {
      return await prisma.jobWorkCompany.update({
        where: { id },
        data: { isActive: false },
      });
    }
  }

  /**
   * Helper: Get materials for select drop-downs
   */
  async getMaterials() {
    return prisma.rawMaterial.findMany({
      where: { isActive: true },
      include: { unit: true, category: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Update an existing Job Work Order
   */
  async update(id: string, dto: UpdateJobWorkOrderDto, userId?: string) {
    const existing = await prisma.jobWorkOrder.findUnique({
      where: { id },
      include: { rawMaterial: true, jobWorkCompany: true },
    });

    if (!existing) {
      throw new NotFoundException(`Job Work Order with ID ${id} not found`);
    }

    const updateData: any = {};

    if (dto.expectedReturnDate) {
      updateData.expectedReturnDate = new Date(dto.expectedReturnDate);
    }
    if (dto.vehicleNumber !== undefined) {
      updateData.vehicleNumber = dto.vehicleNumber;
    }
    if (dto.driverName !== undefined) {
      updateData.driverName = dto.driverName;
    }
    if (dto.remarks !== undefined) {
      updateData.remarks = dto.remarks;
    }
    if (dto.jobWorkCompanyId) {
      updateData.jobWorkCompanyId = dto.jobWorkCompanyId;
    }

    // Material changes only allowed if still in CREATED status
    if (existing.status === JobWorkStatus.CREATED) {
      if (dto.rawMaterialId) {
        updateData.rawMaterialId = dto.rawMaterialId;
      }
      if (dto.finishedProductId !== undefined) {
        updateData.finishedProductId = dto.finishedProductId;
      }
    }

    const updated = await prisma.jobWorkOrder.update({
      where: { id },
      data: updateData,
      include: {
        jobWorkCompany: true,
        rawMaterial: true,
        finishedProduct: true,
        issueItems: true,
        returnItems: true,
      },
    });

    return updated;
  }

  /**
   * Delete or Cancel a Job Work Order
   */
  async delete(id: string, userId?: string) {
    const order = await prisma.jobWorkOrder.findUnique({
      where: { id },
      include: {
        rawMaterial: true,
        issueItems: true,
        returnItems: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Job Work Order with ID ${id} not found`);
    }

    if (order.status === JobWorkStatus.CLOSED) {
      throw new BadRequestException('Closed and reconciled orders cannot be deleted.');
    }

    if (order.returnItems && order.returnItems.length > 0) {
      throw new BadRequestException('Cannot delete an order with returned goods already recorded.');
    }

    return await prisma.$transaction(async (tx) => {
      // If materials were issued, reverse stock back to warehouse
      if (order.status === JobWorkStatus.MATERIALS_ISSUED || order.status === JobWorkStatus.IN_PROGRESS) {
        const issuedWeight = Number(order.totalIssuedWeight) || 0;
        if (issuedWeight > 0 && order.rawMaterialId) {
          const rawMaterialId = order.rawMaterialId;
          const currentMat = await tx.rawMaterial.findUnique({
            where: { id: rawMaterialId },
          });

          if (currentMat) {
            const currentStock = Number(currentMat.currentStockBalance) || 0;
            const restoredStock = currentStock + issuedWeight;

            await tx.rawMaterial.update({
              where: { id: rawMaterialId },
              data: { currentStockBalance: restoredStock },
            });

            await tx.inventoryTransaction.create({
              data: {
                rawMaterialId: rawMaterialId,
                transactionType: TransactionType.ADJUSTMENT_ADD,
                quantity: issuedWeight,
                previousStock: currentStock,
                newStock: restoredStock,
                unitPrice: Number(currentMat.unitCost) || 0,
                notes: `Job Work Order ${order.jobWorkNumber} Cancelled - Restored ${issuedWeight} kg stock`,
                createdByUserId: userId || (await tx.user.findFirstOrThrow()).id,
              },
            });
          }
        }
      }

      // Delete status history & issue items
      await tx.jobWorkStatusHistory.deleteMany({ where: { jobWorkOrderId: id } });
      await tx.jobWorkIssueItem.deleteMany({ where: { jobWorkOrderId: id } });
      await tx.jobWorkOrder.delete({ where: { id } });

      return { success: true, message: `Job Work Order ${order.jobWorkNumber} deleted successfully.` };
    });
  }
}
