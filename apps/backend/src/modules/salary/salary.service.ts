import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { prisma, PayrollStatus } from '@ims/database';
import { PayrollEngineService } from './payroll-engine.service';
import { GeneratePayrollDto } from './dto/generate-payroll.dto';
import { UpdatePayrollItemAdjustmentDto } from './dto/update-payroll-item.dto';
import { RecordSalaryPaymentDto } from './dto/record-payment.dto';

@Injectable()
export class SalaryService {
  constructor(private readonly payrollEngine: PayrollEngineService) {}

  /**
   * Get Dashboard Metrics & Analytics
   */
  async getDashboardSummary() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [totalRuns, pendingRuns, approvedRuns, currentRun] = await Promise.all([
      prisma.payrollRun.count(),
      prisma.payrollRun.count({ where: { status: { in: [PayrollStatus.DRAFT, PayrollStatus.PENDING_APPROVAL] } } }),
      prisma.payrollRun.count({ where: { status: PayrollStatus.APPROVED } }),
      prisma.payrollRun.findUnique({
        where: { month_year: { month: currentMonth, year: currentYear } },
        include: { items: true },
      }),
    ]);

    // Active Employees Count
    const activeEmployeesCount = await prisma.employee.count({
      where: { status: 'ACTIVE', deletedAt: null },
    });

    // Aggregate totals across approved or draft payrolls
    const aggregates = await prisma.payrollRun.aggregate({
      _sum: {
        totalGross: true,
        totalDeductions: true,
        totalBonus: true,
        totalNet: true,
      },
    });

    // Department-wise Salary Breakdown
    const departmentBreakdown = await prisma.employee.groupBy({
      by: ['departmentId'],
      where: { status: 'ACTIVE', deletedAt: null },
      _sum: { baseWage: true },
      _count: { id: true },
    });

    const departmentIds = departmentBreakdown.map((d) => d.departmentId).filter(Boolean) as string[];
    const departments = await prisma.department.findMany({
      where: { id: { in: departmentIds } },
    });

    const deptMap = new Map(departments.map((d) => [d.id, d.name]));
    const formattedDeptBreakdown = departmentBreakdown.map((item) => ({
      departmentName: item.departmentId ? deptMap.get(item.departmentId) || 'Unassigned' : 'Unassigned',
      employeeCount: item._count.id,
      totalBaseWage: Number(item._sum.baseWage || 0),
    }));

    // Monthly Trend
    const recentRuns = await prisma.payrollRun.findMany({
      take: 6,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return {
      kpis: {
        activeEmployees: activeEmployeesCount,
        totalRuns,
        pendingApprovals: pendingRuns,
        approvedRuns,
        totalGrossSalary: Number(aggregates._sum.totalGross || 0),
        totalDeductions: Number(aggregates._sum.totalDeductions || 0),
        totalBonus: Number(aggregates._sum.totalBonus || 0),
        totalNetPayout: Number(aggregates._sum.totalNet || 0),
      },
      currentRun,
      departmentBreakdown: formattedDeptBreakdown,
      monthlyTrend: recentRuns.map((r) => ({
        month: `${r.month}/${r.year}`,
        totalGross: Number(r.totalGross),
        totalNet: Number(r.totalNet),
        status: r.status,
      })),
    };
  }

  /**
   * List Payroll Runs with pagination & filter
   */
  async findAll(query: { month?: number; year?: number; status?: PayrollStatus; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.month) where.month = Number(query.month);
    if (query.year) where.year = Number(query.year);
    if (query.status && query.status !== ('ALL' as any)) where.status = query.status;

    const [items, total] = await Promise.all([
      prisma.payrollRun.findMany({
        where,
        include: {
          generatedByUser: { select: { id: true, email: true } },
          approvedByUser: { select: { id: true, email: true } },
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.payrollRun.count({ where }),
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
   * Get single Payroll Run with employee line items
   */
  async findOne(id: string) {
    const run = await prisma.payrollRun.findUnique({
      where: { id },
      include: {
        generatedByUser: { select: { id: true, email: true } },
        approvedByUser: { select: { id: true, email: true } },
        items: {
          include: {
            employee: {
              include: {
                department: true,
                designation: true,
              },
            },
            adjustments: true,
            payments: true,
            salarySlip: true,
          },
          orderBy: { employee: { firstName: 'asc' } },
        },
      },
    });

    if (!run) {
      throw new NotFoundException(`Payroll run with ID ${id} not found`);
    }

    return run;
  }

  /**
   * Generate Payroll Run (Monthly or Weekly)
   */
  async generatePayroll(dto: GeneratePayrollDto, userId?: string) {
    const periodType = dto.periodType || 'MONTHLY';
    let calculatedItems: any[] = [];
    let payrollCode = '';

    if (periodType === 'WEEKLY') {
      calculatedItems = await this.payrollEngine.calculateWeeklyPayroll(dto.weekNumber, dto.startDate, dto.endDate);
      const wkStr = String(dto.weekNumber || 1).padStart(2, '0');
      payrollCode = `PAY-WK${wkStr}-${dto.year}`;
    } else {
      const existingRun = await prisma.payrollRun.findFirst({
        where: { month: dto.month, year: dto.year, periodType: 'MONTHLY' },
      });

      if (existingRun && existingRun.status !== PayrollStatus.CANCELLED) {
        throw new BadRequestException(
          `Monthly Payroll run for ${dto.month}/${dto.year} already exists with status ${existingRun.status}`,
        );
      }

      calculatedItems = await this.payrollEngine.calculateMonthlyPayroll(dto.month, dto.year);
      const monthStr = String(dto.month).padStart(2, '0');
      payrollCode = `PAY-${dto.year}-${monthStr}`;
    }

    if (calculatedItems.length === 0) {
      throw new BadRequestException('No active employees found to generate payroll');
    }

    let totalGross = 0;
    let totalDeductions = 0;
    let totalBonus = 0;
    let totalOvertime = 0;
    let totalNet = 0;

    for (const item of calculatedItems) {
      totalGross += item.grossSalary;
      totalDeductions += item.totalDeductions;
      totalBonus += item.bonusAmount;
      totalOvertime += item.overtimeSalary;
      totalNet += item.netSalary;
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : null;
    const endDate = dto.endDate ? new Date(dto.endDate) : null;

    // Use transaction to create header & line items
    const payrollRun = await prisma.$transaction(async (tx) => {
      const run = await tx.payrollRun.create({
        data: {
          payrollCode,
          month: dto.month,
          year: dto.year,
          periodType,
          weekNumber: dto.weekNumber || null,
          startDate,
          endDate,
          totalEmployees: calculatedItems.length,
          totalGross,
          totalDeductions,
          totalBonus,
          totalOvertime,
          totalNet,
          status: PayrollStatus.DRAFT,
          remarks: dto.remarks,
          generatedByUserId: userId,
        },
      });

      await tx.payrollItem.createMany({
        data: calculatedItems.map((item) => ({
          payrollRunId: run.id,
          employeeId: item.employeeId,
          salaryType: item.salaryType,
          periodType: item.periodType || periodType,
          baseWage: item.baseWage,
          workingDaysInMonth: item.workingDaysInMonth,
          presentDays: item.presentDays,
          absentDays: item.absentDays,
          halfDays: item.halfDays,
          leaveDays: item.leaveDays,
          holidayCount: item.holidayCount,
          weeklyOffCount: item.weeklyOffCount,
          payableDays: item.payableDays,
          basicSalary: item.basicSalary,
          overtimeHours: item.overtimeHours,
          overtimeRate: item.overtimeRate,
          overtimeSalary: item.overtimeSalary,
          grossSalary: item.grossSalary,
          bonusAmount: item.bonusAmount,
          incentiveAmount: item.incentiveAmount,
          lateDeduction: item.lateDeduction,
          advanceDeduction: item.advanceDeduction,
          loanDeduction: item.loanDeduction,
          pfDeduction: item.pfDeduction,
          esiDeduction: item.esiDeduction,
          professionalTax: item.professionalTax,
          otherDeductions: item.otherDeductions,
          totalDeductions: item.totalDeductions,
          netSalary: item.netSalary,
          status: PayrollStatus.DRAFT,
        })),
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: 'PAYROLL_GENERATED',
          entityName: 'PayrollRun',
          entityId: run.id,
          newValues: { payrollCode, periodType, month: dto.month, year: dto.year, count: calculatedItems.length, totalNet },
          userId,
        },
      });

      return run;
    });

    return this.findOne(payrollRun.id);
  }

  /**
   * Update Payroll Item Adjustments (Bonus, Late, Advance, OT, PT, etc.)
   */
  async updatePayrollItemAdjustment(itemId: string, dto: UpdatePayrollItemAdjustmentDto, userId?: string) {
    const item = await prisma.payrollItem.findUnique({
      where: { id: itemId },
      include: { payrollRun: true },
    });

    if (!item) {
      throw new NotFoundException(`Payroll item ${itemId} not found`);
    }

    if (item.payrollRun.status === PayrollStatus.APPROVED || item.payrollRun.status === PayrollStatus.PAID) {
      throw new BadRequestException('Cannot edit adjustments on an approved or paid payroll');
    }

    const bonusAmount = dto.bonusAmount !== undefined ? dto.bonusAmount : Number(item.bonusAmount);
    const incentiveAmount = dto.incentiveAmount !== undefined ? dto.incentiveAmount : Number(item.incentiveAmount);
    const overtimeHours = dto.overtimeHours !== undefined ? dto.overtimeHours : Number(item.overtimeHours);
    const overtimeRate = dto.overtimeRate !== undefined ? dto.overtimeRate : Number(item.overtimeRate);
    const overtimeSalary = Math.round(overtimeHours * overtimeRate * 100) / 100;

    const lateDeduction = dto.lateDeduction !== undefined ? dto.lateDeduction : Number(item.lateDeduction);
    const advanceDeduction = dto.advanceDeduction !== undefined ? dto.advanceDeduction : Number(item.advanceDeduction);
    const loanDeduction = dto.loanDeduction !== undefined ? dto.loanDeduction : Number(item.loanDeduction);
    const pfDeduction = dto.pfDeduction !== undefined ? dto.pfDeduction : Number(item.pfDeduction);
    const esiDeduction = dto.esiDeduction !== undefined ? dto.esiDeduction : Number(item.esiDeduction);
    const professionalTax = dto.professionalTax !== undefined ? dto.professionalTax : Number(item.professionalTax);
    const otherDeductions = dto.otherDeductions !== undefined ? dto.otherDeductions : Number(item.otherDeductions);

    const grossSalary = Math.round((Number(item.basicSalary) + overtimeSalary + bonusAmount + incentiveAmount) * 100) / 100;
    const totalDeductions = Math.round((lateDeduction + advanceDeduction + loanDeduction + pfDeduction + esiDeduction + professionalTax + otherDeductions) * 100) / 100;
    const netSalary = Math.max(0, Math.round((grossSalary - totalDeductions) * 100) / 100);

    const updatedItem = await prisma.$transaction(async (tx) => {
      const res = await tx.payrollItem.update({
        where: { id: itemId },
        data: {
          overtimeHours,
          overtimeRate,
          overtimeSalary,
          bonusAmount,
          incentiveAmount,
          lateDeduction,
          advanceDeduction,
          loanDeduction,
          pfDeduction,
          esiDeduction,
          professionalTax,
          otherDeductions,
          grossSalary,
          totalDeductions,
          netSalary,
        },
      });

      // Recalculate PayrollRun totals
      const items = await tx.payrollItem.findMany({
        where: { payrollRunId: item.payrollRunId },
      });

      const totalGross = items.reduce((acc, i) => acc + Number(i.grossSalary), 0);
      const totalDeductionsSum = items.reduce((acc, i) => acc + Number(i.totalDeductions), 0);
      const totalBonusSum = items.reduce((acc, i) => acc + Number(i.bonusAmount), 0);
      const totalOvertimeSum = items.reduce((acc, i) => acc + Number(i.overtimeSalary), 0);
      const totalNetSum = items.reduce((acc, i) => acc + Number(i.netSalary), 0);

      await tx.payrollRun.update({
        where: { id: item.payrollRunId },
        data: {
          totalGross,
          totalDeductions: totalDeductionsSum,
          totalBonus: totalBonusSum,
          totalOvertime: totalOvertimeSum,
          totalNet: totalNetSum,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'PAYROLL_ITEM_UPDATED',
          entityName: 'PayrollItem',
          entityId: itemId,
          oldValues: { netSalary: Number(item.netSalary) },
          newValues: { netSalary, bonusAmount, overtimeSalary, totalDeductions },
          userId,
        },
      });

      return res;
    });

    return updatedItem;
  }

  /**
   * Approve Payroll Run (Admin Action)
   */
  async approvePayroll(id: string, userId?: string) {
    const run = await prisma.payrollRun.findUnique({
      where: { id },
      include: { items: { include: { employee: true } } },
    });

    if (!run) {
      throw new NotFoundException(`Payroll run ${id} not found`);
    }

    if (run.status === PayrollStatus.APPROVED || run.status === PayrollStatus.PAID) {
      throw new BadRequestException('Payroll run is already approved or paid');
    }

    const approvedRun = await prisma.$transaction(async (tx) => {
      // Update Run Status
      const updated = await tx.payrollRun.update({
        where: { id },
        data: {
          status: PayrollStatus.APPROVED,
          approvedAt: new Date(),
          approvedByUserId: userId,
        },
      });

      // Update Line Items & Generate Slips & Salary History
      for (const item of run.items) {
        await tx.payrollItem.update({
          where: { id: item.id },
          data: { status: PayrollStatus.APPROVED },
        });

        const slipNumber = `SLIP-${run.year}${String(run.month).padStart(2, '0')}-${item.employee.employeeCode}`;

        // Create Salary Slip metadata
        await tx.salarySlip.upsert({
          where: { payrollItemId: item.id },
          create: {
            slipNumber,
            payrollItemId: item.id,
            employeeId: item.employeeId,
            month: run.month,
            year: run.year,
            generatedByUserId: userId,
          },
          update: {
            generatedAt: new Date(),
          },
        });

        // Create Salary History Record
        await tx.salaryHistory.create({
          data: {
            employeeId: item.employeeId,
            month: run.month,
            year: run.year,
            salaryType: item.salaryType,
            grossSalary: item.grossSalary,
            totalDeductions: item.totalDeductions,
            netSalary: item.netSalary,
            status: 'APPROVED',
            snapshotData: {
              basicSalary: Number(item.basicSalary),
              overtimeHours: Number(item.overtimeHours),
              overtimeRate: Number(item.overtimeRate),
              overtimeSalary: Number(item.overtimeSalary),
              advanceDeduction: Number(item.advanceDeduction),
              bonusAmount: Number(item.bonusAmount),
              professionalTax: Number(item.professionalTax),
              presentDays: Number(item.presentDays),
              payableDays: Number(item.payableDays),
            },
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'PAYROLL_APPROVED',
          entityName: 'PayrollRun',
          entityId: id,
          newValues: { payrollCode: run.payrollCode, status: PayrollStatus.APPROVED },
          userId,
        },
      });

      return updated;
    });

    return this.findOne(approvedRun.id);
  }

  /**
   * Cancel Payroll Run (Admin Only)
   */
  async cancelPayroll(id: string, userId?: string) {
    const run = await prisma.payrollRun.findUnique({ where: { id } });
    if (!run) throw new NotFoundException(`Payroll run ${id} not found`);

    if (run.status === PayrollStatus.PAID) {
      throw new BadRequestException('Cannot cancel a fully paid payroll run');
    }

    const cancelledRun = await prisma.$transaction(async (tx) => {
      const res = await tx.payrollRun.update({
        where: { id },
        data: { status: PayrollStatus.CANCELLED },
      });

      await tx.payrollItem.updateMany({
        where: { payrollRunId: id },
        data: { status: PayrollStatus.CANCELLED },
      });

      await tx.auditLog.create({
        data: {
          action: 'PAYROLL_CANCELLED',
          entityName: 'PayrollRun',
          entityId: id,
          userId,
        },
      });

      return res;
    });

    return cancelledRun;
  }

  /**
   * Record Payment for Payroll Item
   */
  async recordPayment(dto: RecordSalaryPaymentDto, userId?: string) {
    if (!dto.payrollItemId) {
      throw new BadRequestException('payrollItemId is required to pay a payroll item');
    }

    const item = await prisma.payrollItem.findUnique({
      where: { id: dto.payrollItemId },
      include: { payrollRun: true, employee: true },
    });

    if (!item) throw new NotFoundException(`Payroll item ${dto.payrollItemId} not found`);

    if (item.payrollRun.status === PayrollStatus.CANCELLED) {
      throw new BadRequestException('Cannot record payment for a cancelled payroll run');
    }

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.salaryPayment.create({
        data: {
          payrollItemId: dto.payrollItemId,
          employeeId: item.employeeId,
          paymentType: dto.paymentType || 'NORMAL_SALARY',
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          transactionRef: dto.transactionRef,
          remarks: dto.remarks,
          paidByUserId: userId,
        },
      });

      await tx.payrollItem.update({
        where: { id: dto.payrollItemId },
        data: { status: PayrollStatus.PAID },
      });

      // Deduct advance if advanceDeduction was applied on this item
      const advDed = Number(item.advanceDeduction);
      if (advDed > 0) {
        const activeAdvances = await tx.employeeAdvance.findMany({
          where: { employeeId: item.employeeId, status: 'ACTIVE' },
          orderBy: { createdAt: 'asc' },
        });

        let remainingToDeduct = advDed;
        for (const adv of activeAdvances) {
          if (remainingToDeduct <= 0) break;
          const bal = Number(adv.balanceAmount);
          const ded = Math.min(bal, remainingToDeduct);
          const newBal = bal - ded;
          const newRepaid = Number(adv.repaidAmount) + ded;
          const newStatus = newBal <= 0 ? 'FULLY_REPAID' : 'ACTIVE';

          await tx.employeeAdvance.update({
            where: { id: adv.id },
            data: {
              repaidAmount: newRepaid,
              balanceAmount: newBal,
              status: newStatus,
            },
          });

          await tx.advanceRepayment.create({
            data: {
              advanceId: adv.id,
              employeeId: item.employeeId,
              amount: ded,
              paymentMethod: dto.paymentMethod,
              payrollItemId: item.id,
              notes: `Deducted via Payroll batch ${item.payrollRun.payrollCode}`,
              recordedByUserId: userId,
            },
          });

          remainingToDeduct -= ded;
        }
      }

      // Update Salary History status to PAID
      await tx.salaryHistory.updateMany({
        where: {
          employeeId: item.employeeId,
          month: item.payrollRun.month,
          year: item.payrollRun.year,
        },
        data: {
          status: 'PAID',
          paymentDate: new Date(),
        },
      });

      // Check if all items in this run are paid
      const unpaidCount = await tx.payrollItem.count({
        where: {
          payrollRunId: item.payrollRunId,
          status: { not: PayrollStatus.PAID },
        },
      });

      if (unpaidCount === 0) {
        await tx.payrollRun.update({
          where: { id: item.payrollRunId },
          data: { status: PayrollStatus.PAID },
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'PAYMENT_RECORDED',
          entityName: 'SalaryPayment',
          entityId: p.id,
          newValues: { amount: dto.amount, method: dto.paymentMethod, ref: dto.transactionRef },
          userId,
        },
      });

      return p;
    });

    return payment;
  }

  /**
   * Get Salary Slip Document Details
   */
  async getSalarySlip(itemId: string) {
    const item = await prisma.payrollItem.findUnique({
      where: { id: itemId },
      include: {
        employee: {
          include: {
            department: true,
            designation: true,
          },
        },
        payrollRun: true,
        adjustments: true,
        payments: true,
        salarySlip: true,
      },
    });

    if (!item) throw new NotFoundException(`Payroll item ${itemId} not found`);

    return item;
  }

  /**
   * Get Salary History Logs
   */
  async getSalaryHistory(employeeId?: string, year?: number) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (year) where.year = Number(year);

    return prisma.salaryHistory.findMany({
      where,
      include: {
        employee: {
          include: {
            department: true,
            designation: true,
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }
}
