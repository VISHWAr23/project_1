import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, EmployeeStatus } from '@ims/database';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class EmployeeService {
  /**
   * Helper: Generate unique Employee Code (e.g. EMP-001, EMP-002)
   */
  private async generateEmployeeCode(): Promise<string> {
    const count = await prisma.employee.count();
    const nextNum = count + 1;
    const formattedNum = String(nextNum).padStart(3, '0');
    let code = `EMP-${formattedNum}`;

    let exists = await prisma.employee.findUnique({ where: { employeeCode: code } });
    let incrementer = 1;
    while (exists) {
      code = `EMP-${String(nextNum + incrementer).padStart(3, '0')}`;
      exists = await prisma.employee.findUnique({ where: { employeeCode: code } });
      incrementer++;
    }
    return code;
  }

  /**
   * List all employees with search, pagination, and status filters
   */
  async findAll(query: {
    search?: string;
    departmentId?: string;
    designationId?: string;
    status?: EmployeeStatus | string;
    employmentType?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null, // Soft Delete Filter
    };

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.departmentId && query.departmentId !== 'ALL') {
      where.departmentId = query.departmentId;
    }

    if (query.designationId && query.designationId !== 'ALL') {
      where.designationId = query.designationId;
    }

    if (query.employmentType && query.employmentType !== 'ALL') {
      where.employmentType = query.employmentType;
    }

    if (query.search) {
      const searchLower = query.search.trim();
      where.OR = [
        { firstName: { contains: searchLower, mode: 'insensitive' } },
        { lastName: { contains: searchLower, mode: 'insensitive' } },
        { employeeCode: { contains: searchLower, mode: 'insensitive' } },
        { phone: { contains: searchLower, mode: 'insensitive' } },
        { email: { contains: searchLower, mode: 'insensitive' } },
        { department: { name: { contains: searchLower, mode: 'insensitive' } } },
      ];
    }

    const [items, total, allEmployees] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          department: true,
          designation: true,
          documents: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where: { deletedAt: null },
        select: { status: true, employmentType: true },
      }),
    ]);

    const stats = {
      totalEmployees: allEmployees.length,
      activeEmployees: allEmployees.filter((e) => e.status === EmployeeStatus.ACTIVE).length,
      inactiveEmployees: allEmployees.filter((e) => e.status === EmployeeStatus.INACTIVE).length,
      contractEmployees: allEmployees.filter((e) => e.employmentType === 'Contract').length,
    };

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    };
  }

  /**
   * Get single employee profile with documents and relations
   */
  async findOne(id: string) {
    const employee = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
      include: {
        department: true,
        designation: true,
        documents: true,
        salaryStructure: true,
        attendanceLogs: {
          take: 30,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  /**
   * Create new Employee record
   */
  async create(dto: CreateEmployeeDto, userId?: string) {
    const employeeCode = dto.employeeCode?.trim() || (await this.generateEmployeeCode());

    // Check duplicate code
    const existingCode = await prisma.employee.findUnique({ where: { employeeCode } });
    if (existingCode) {
      throw new BadRequestException(`Employee code ${employeeCode} already exists`);
    }

    const joiningDate = dto.joiningDate ? new Date(dto.joiningDate) : new Date();
    const dob = dto.dob ? new Date(dto.dob) : null;

    const employee = await prisma.employee.create({
      data: {
        employeeCode,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        alternatePhone: dto.alternatePhone,
        email: dto.email,
        avatarUrl: dto.avatarUrl,
        gender: dto.gender,
        dob,
        bloodGroup: dto.bloodGroup,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        pinCode: dto.pinCode,
        emergencyContact: dto.emergencyContact,
        emergencyPhone: dto.emergencyPhone,
        aadhaarNo: dto.aadhaarNo,
        panNo: dto.panNo,
        joiningDate,
        employmentType: dto.employmentType || 'Permanent',
        shift: dto.shift || 'General Day',
        salaryType: dto.salaryType || 'Monthly Salary',
        salaryCycle: dto.salaryCycle || 'MONTHLY',
        baseWage: dto.baseWage !== undefined ? dto.baseWage : 0,
        otRatePerHour: dto.otRatePerHour !== undefined ? dto.otRatePerHour : 0,
        bankName: dto.bankName,
        bankAccountNo: dto.bankAccountNo,
        bankIfsc: dto.bankIfsc,
        upiId: dto.upiId,
        status: dto.status || EmployeeStatus.ACTIVE,
        departmentId: dto.departmentId || null,
        designationId: dto.designationId || null,
      },
      include: {
        department: true,
        designation: true,
      },
    });

    // Write Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'CREATE_EMPLOYEE',
          entityName: 'Employee',
          entityId: employee.id,
          newValues: employee as any,
          userId: userId || null,
        },
      });
    } catch {
      // Audit log non-blocking
    }

    return employee;
  }

  /**
   * Update existing Employee record
   */
  async update(id: string, dto: UpdateEmployeeDto, userId?: string) {
    const existing = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const dataToUpdate: any = {};

    if (dto.firstName !== undefined) dataToUpdate.firstName = dto.firstName;
    if (dto.lastName !== undefined) dataToUpdate.lastName = dto.lastName;
    if (dto.phone !== undefined) dataToUpdate.phone = dto.phone;
    if (dto.alternatePhone !== undefined) dataToUpdate.alternatePhone = dto.alternatePhone;
    if (dto.email !== undefined) dataToUpdate.email = dto.email;
    if (dto.avatarUrl !== undefined) dataToUpdate.avatarUrl = dto.avatarUrl;
    if (dto.gender !== undefined) dataToUpdate.gender = dto.gender;
    if (dto.dob !== undefined) dataToUpdate.dob = dto.dob ? new Date(dto.dob) : null;
    if (dto.bloodGroup !== undefined) dataToUpdate.bloodGroup = dto.bloodGroup;
    if (dto.address !== undefined) dataToUpdate.address = dto.address;
    if (dto.city !== undefined) dataToUpdate.city = dto.city;
    if (dto.state !== undefined) dataToUpdate.state = dto.state;
    if (dto.pinCode !== undefined) dataToUpdate.pinCode = dto.pinCode;
    if (dto.emergencyContact !== undefined) dataToUpdate.emergencyContact = dto.emergencyContact;
    if (dto.emergencyPhone !== undefined) dataToUpdate.emergencyPhone = dto.emergencyPhone;
    if (dto.aadhaarNo !== undefined) dataToUpdate.aadhaarNo = dto.aadhaarNo;
    if (dto.panNo !== undefined) dataToUpdate.panNo = dto.panNo;
    if (dto.joiningDate !== undefined) dataToUpdate.joiningDate = new Date(dto.joiningDate);
    if (dto.employmentType !== undefined) dataToUpdate.employmentType = dto.employmentType;
    if (dto.shift !== undefined) dataToUpdate.shift = dto.shift;
    if (dto.salaryType !== undefined) dataToUpdate.salaryType = dto.salaryType;
    if (dto.salaryCycle !== undefined) dataToUpdate.salaryCycle = dto.salaryCycle;
    if (dto.baseWage !== undefined) dataToUpdate.baseWage = dto.baseWage;
    if (dto.otRatePerHour !== undefined) dataToUpdate.otRatePerHour = dto.otRatePerHour;
    if (dto.bankName !== undefined) dataToUpdate.bankName = dto.bankName;
    if (dto.bankAccountNo !== undefined) dataToUpdate.bankAccountNo = dto.bankAccountNo;
    if (dto.bankIfsc !== undefined) dataToUpdate.bankIfsc = dto.bankIfsc;
    if (dto.upiId !== undefined) dataToUpdate.upiId = dto.upiId;
    if (dto.status !== undefined) dataToUpdate.status = dto.status;
    if (dto.departmentId !== undefined) dataToUpdate.departmentId = dto.departmentId || null;
    if (dto.designationId !== undefined) dataToUpdate.designationId = dto.designationId || null;

    const updated = await prisma.employee.update({
      where: { id },
      data: dataToUpdate,
      include: {
        department: true,
        designation: true,
        documents: true,
        salaryStructure: true,
        advances: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Write Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_EMPLOYEE',
          entityName: 'Employee',
          entityId: updated.id,
          oldValues: existing as any,
          newValues: updated as any,
          userId: userId || null,
        },
      });
    } catch {
      // Audit log non-blocking
    }

    return updated;
  }

  /**
   * Get Comprehensive Financial & Compensation Summary for Employee Profile
   */
  async getFinancialSummary(employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, deletedAt: null },
      include: {
        department: true,
        designation: true,
        salaryStructure: true,
        advances: {
          include: { repayments: true },
          orderBy: { createdAt: 'desc' },
        },
        salaryPayments: {
          take: 10,
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Determine current cycle period (weekly or monthly)
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    const salaryCycle = employee.salaryCycle || 'MONTHLY';
    if (salaryCycle === 'WEEKLY') {
      // Current week ending on upcoming/current Saturday
      const dayOfWeek = now.getDay(); // 0 is Sun, 6 is Sat
      const diffToSaturday = (6 - dayOfWeek + 7) % 7;
      const saturday = new Date(now);
      saturday.setDate(now.getDate() + diffToSaturday);
      saturday.setHours(23, 59, 59, 999);

      const monday = new Date(saturday);
      monday.setDate(saturday.getDate() - 5);
      monday.setHours(0, 0, 0, 0);

      startDate = monday;
      endDate = saturday;
    } else {
      // Monthly: 1st of current month to end of current month
      startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
      endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));
    }

    // Fetch attendance logs for current cycle
    const currentCycleLogs = await prisma.attendanceLog.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    let presentDays = 0;
    let halfDays = 0;
    let totalWorkingHours = 0;
    let totalOvertimeHours = 0;
    let totalOtAmount = 0;

    for (const log of currentCycleLogs) {
      if (log.status === 'PRESENT') presentDays += 1;
      if (log.status === 'HALF_DAY') halfDays += 1;
      totalWorkingHours += Number(log.workingHours || 0);
      totalOvertimeHours += Number(log.overtimeHours || 0);
      totalOtAmount += Number(log.otAmount || 0);
    }

    // Advance balances
    const activeAdvances = employee.advances.filter((a) => a.status === 'ACTIVE');
    const totalAdvanceGiven = employee.advances.reduce((acc, a) => acc + Number(a.amount || 0), 0);
    const totalAdvanceRepaid = employee.advances.reduce((acc, a) => acc + Number(a.repaidAmount || 0), 0);
    const outstandingAdvanceBalance = activeAdvances.reduce((acc, a) => acc + Number(a.balanceAmount || 0), 0);
    const weeklyDeductionTotal = activeAdvances.reduce((acc, a) => acc + Number(a.weeklyDeduction || 0), 0);

    // Normal Base Salary estimate (Base Wage is Daily Rate)
    const baseWage = Number(employee.baseWage || (employee.salaryStructure ? employee.salaryStructure.baseSalary : 0));
    const payableDays = presentDays + 0.5 * halfDays;
    const baseSalaryEarned = Math.round(baseWage * payableDays * 100) / 100;

    const otRatePerHour = Number(employee.otRatePerHour || 0);
    const otSalaryEarned = Math.round(totalOvertimeHours * otRatePerHour * 100) / 100;

    return {
      employee: {
        id: employee.id,
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
        department: employee.department?.name || 'Unassigned',
        designation: employee.designation?.name || 'Staff',
        salaryType: employee.salaryType || 'Monthly Salary',
        salaryCycle,
        baseWage,
        otRatePerHour,
      },
      currentCycle: {
        periodType: salaryCycle,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        presentDays,
        halfDays,
        totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
        totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
        baseSalaryEarned,
        otSalaryEarned,
      },
      advances: {
        activeAdvances,
        totalAdvanceGiven,
        totalAdvanceRepaid,
        outstandingBalance: outstandingAdvanceBalance,
        weeklyDeductionTotal,
      },
      recentPayments: employee.salaryPayments,
      settlementSummary: {
        baseSalaryEarned,
        otSalaryEarned,
        totalGrossEarned: Math.round((baseSalaryEarned + otSalaryEarned) * 100) / 100,
        pendingAdvanceDeduction: Math.min(outstandingAdvanceBalance, weeklyDeductionTotal > 0 ? weeklyDeductionTotal : outstandingAdvanceBalance),
        estimatedNetPayout: Math.max(
          0,
          Math.round(
            (baseSalaryEarned +
              otSalaryEarned -
              Math.min(outstandingAdvanceBalance, weeklyDeductionTotal > 0 ? weeklyDeductionTotal : outstandingAdvanceBalance)) *
              100,
          ) / 100,
        ),
      },
    };
  }

  /**
   * Disburse / Create New Advance for Employee
   */
  async createAdvance(dto: { employeeId: string; amount: number; weeklyDeduction?: number; reason?: string; issueDate?: string }, userId?: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: dto.employeeId, deletedAt: null },
    });
    if (!employee) throw new NotFoundException(`Employee with ID ${dto.employeeId} not found`);

    const issueDate = dto.issueDate ? new Date(dto.issueDate) : new Date();

    const advance = await prisma.$transaction(async (tx) => {
      const adv = await tx.employeeAdvance.create({
        data: {
          employeeId: dto.employeeId,
          amount: dto.amount,
          repaidAmount: 0,
          balanceAmount: dto.amount,
          weeklyDeduction: dto.weeklyDeduction || 0,
          reason: dto.reason || 'Salary Advance / Emergency Loan',
          status: 'ACTIVE',
          issueDate,
          createdByUserId: userId || null,
        },
      });

      // Record SalaryPayment entry for audit/ledger
      await tx.salaryPayment.create({
        data: {
          employeeId: dto.employeeId,
          paymentType: 'ADVANCE_DISBURSEMENT',
          amount: dto.amount,
          paymentMethod: 'CASH',
          paymentDate: issueDate,
          remarks: `Advance disbursed: ${dto.reason || 'Salary Advance'} (Weekly Repayment: ₹${dto.weeklyDeduction || 0})`,
          paidByUserId: userId || null,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'ADVANCE_DISBURSED',
          entityName: 'EmployeeAdvance',
          entityId: adv.id,
          newValues: { amount: dto.amount, employeeId: dto.employeeId, weeklyDeduction: dto.weeklyDeduction },
          userId: userId || null,
        },
      });

      return adv;
    });

    return advance;
  }

  /**
   * Repay Advance Installment
   */
  async repayAdvance(dto: { advanceId: string; amount: number; paymentMethod?: any; notes?: string }, userId?: string) {
    const advance = await prisma.employeeAdvance.findUnique({
      where: { id: dto.advanceId },
      include: { employee: true },
    });
    if (!advance) throw new NotFoundException(`Advance record with ID ${dto.advanceId} not found`);

    const currentBalance = Number(advance.balanceAmount);
    const newRepaid = Number(advance.repaidAmount) + dto.amount;
    const newBalance = Math.max(0, currentBalance - dto.amount);
    const newStatus = newBalance <= 0 ? 'FULLY_REPAID' : 'ACTIVE';

    const repayment = await prisma.$transaction(async (tx) => {
      const rep = await tx.advanceRepayment.create({
        data: {
          advanceId: dto.advanceId,
          employeeId: advance.employeeId,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod || 'CASH',
          notes: dto.notes || 'Advance Installment Repayment',
          recordedByUserId: userId || null,
        },
      });

      await tx.employeeAdvance.update({
        where: { id: dto.advanceId },
        data: {
          repaidAmount: newRepaid,
          balanceAmount: newBalance,
          status: newStatus,
        },
      });

      await tx.salaryPayment.create({
        data: {
          employeeId: advance.employeeId,
          paymentType: 'ADVANCE_REPAYMENT',
          amount: dto.amount,
          paymentMethod: dto.paymentMethod || 'CASH',
          remarks: `Advance Repayment received for Advance ${advance.id.slice(0, 8)} (${dto.notes || 'Repayment'})`,
          paidByUserId: userId || null,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'ADVANCE_REPAID',
          entityName: 'AdvanceRepayment',
          entityId: rep.id,
          newValues: { amount: dto.amount, remainingBalance: newBalance, status: newStatus },
          userId: userId || null,
        },
      });

      return rep;
    });

    return repayment;
  }

  /**
   * Settle Any Payment Directly From Employee Profile (Normal Salary, OT Salary, Advance, Full Settlement)
   */
  async settlePayment(
    dto: {
      employeeId: string;
      paymentType: 'NORMAL_SALARY' | 'OVERTIME_SALARY' | 'ADVANCE_DISBURSEMENT' | 'ADVANCE_REPAYMENT' | 'FULL_SETTLEMENT';
      amount: number;
      advanceDeduction?: number;
      netAmount?: number;
      weeklyDeduction?: number;
      paymentMethod?: any;
      transactionRef?: string;
      remarks?: string;
      advanceId?: string;
    },
    userId?: string,
  ) {
    const employee = await prisma.employee.findFirst({
      where: { id: dto.employeeId, deletedAt: null },
    });
    if (!employee) throw new NotFoundException(`Employee with ID ${dto.employeeId} not found`);

    if (dto.paymentType === 'ADVANCE_DISBURSEMENT') {
      return this.createAdvance(
        {
          employeeId: dto.employeeId,
          amount: dto.amount,
          weeklyDeduction: dto.weeklyDeduction,
          reason: dto.remarks,
        },
        userId,
      );
    }

    if (dto.paymentType === 'ADVANCE_REPAYMENT' && dto.advanceId) {
      return this.repayAdvance(
        {
          advanceId: dto.advanceId,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          notes: dto.remarks,
        },
        userId,
      );
    }

    // Direct Salary, OT or Full Settlement with optional advance deduction
    const advanceDed = Number(dto.advanceDeduction || 0);
    const netPayout = dto.netAmount !== undefined ? dto.netAmount : Math.max(0, dto.amount - advanceDed);

    const payment = await prisma.$transaction(async (tx) => {
      // If an advance deduction is specified, deduct it from active advances in chronological order
      if (advanceDed > 0) {
        const activeAdvances = await tx.employeeAdvance.findMany({
          where: { employeeId: dto.employeeId, status: 'ACTIVE' },
          orderBy: { createdAt: 'asc' },
        });

        let remainingDed = advanceDed;
        for (const adv of activeAdvances) {
          if (remainingDed <= 0) break;
          const currentBal = Number(adv.balanceAmount);
          const deductThis = Math.min(currentBal, remainingDed);
          const newBal = currentBal - deductThis;
          const newRepaid = Number(adv.repaidAmount) + deductThis;
          const newStatus = newBal <= 0 ? 'FULLY_REPAID' : 'ACTIVE';

          await tx.employeeAdvance.update({
            where: { id: adv.id },
            data: {
              balanceAmount: newBal,
              repaidAmount: newRepaid,
              status: newStatus,
            },
          });

          await tx.advanceRepayment.create({
            data: {
              advanceId: adv.id,
              employeeId: dto.employeeId,
              amount: deductThis,
              paymentMethod: dto.paymentMethod || 'CASH',
              notes: `Deduction of ₹${deductThis} from salary payout`,
              recordedByUserId: userId || null,
            },
          });

          remainingDed -= deductThis;
        }
      }

      // Generate clean remarks noting gross, deduction, and net
      let finalRemarks = dto.remarks;
      if (!finalRemarks) {
        if (advanceDed > 0) {
          finalRemarks = `Gross: ₹${dto.amount} | Advance Ded: ₹${advanceDed} | Net Paid: ₹${netPayout}`;
        } else {
          finalRemarks = `Direct Settlement: ₹${netPayout} (${dto.paymentType.replace('_', ' ')})`;
        }
      }

      const p = await tx.salaryPayment.create({
        data: {
          employeeId: dto.employeeId,
          paymentType: dto.paymentType,
          amount: netPayout,
          paymentMethod: dto.paymentMethod || 'CASH',
          transactionRef: dto.transactionRef,
          remarks: finalRemarks,
          paidByUserId: userId || null,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'EMPLOYEE_PAYMENT_SETTLED',
          entityName: 'SalaryPayment',
          entityId: p.id,
          newValues: {
            type: dto.paymentType,
            grossAmount: dto.amount,
            advanceDeduction: advanceDed,
            netPaid: netPayout,
            employeeId: dto.employeeId,
          },
          userId: userId || null,
        },
      });

      return p;
    });

    return payment;
  }

  /**
   * Get Complete Payment & Transaction History for an Employee
   */
  async getPaymentHistory(employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, deletedAt: null },
    });
    if (!employee) throw new NotFoundException(`Employee with ID ${employeeId} not found`);

    const [payments, advances, repayments] = await Promise.all([
      prisma.salaryPayment.findMany({
        where: { employeeId },
        include: { paidByUser: { select: { id: true, email: true } } },
        orderBy: { paymentDate: 'desc' },
      }),
      prisma.employeeAdvance.findMany({
        where: { employeeId },
        include: { repayments: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.advanceRepayment.findMany({
        where: { employeeId },
        include: { recordedByUser: { select: { id: true, email: true } } },
        orderBy: { repaymentDate: 'desc' },
      }),
    ]);

    return {
      payments,
      advances,
      repayments,
    };
  }

  /**
   * Soft Delete Employee (sets deletedAt and INACTIVE status)
   */
  async softDelete(id: string, userId?: string) {
    const existing = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: EmployeeStatus.INACTIVE,
      },
    });

    // Write Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'SOFT_DELETE_EMPLOYEE',
          entityName: 'Employee',
          entityId: id,
          oldValues: existing as any,
          newValues: updated as any,
          userId: userId || null,
        },
      });
    } catch {
      // Audit log non-blocking
    }

    return { message: 'Employee soft-deleted successfully', id };
  }

  /**
   * Upload Document Metadata to Employee
   */
  async uploadDocument(employeeId: string, dto: UploadDocumentDto) {
    await this.findOne(employeeId); // verify exists

    const doc = await prisma.employeeDocument.create({
      data: {
        employeeId,
        documentType: dto.documentType,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        storagePath: dto.storagePath,
      },
    });

    return doc;
  }

  /**
   * Delete Employee Document Record
   */
  async deleteDocument(docId: string) {
    const doc = await prisma.employeeDocument.findUnique({ where: { id: docId } });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${docId} not found`);
    }

    await prisma.employeeDocument.delete({ where: { id: docId } });
    return { message: 'Document deleted successfully', id: docId };
  }

  /**
   * List or seed Departments
   */
  async getDepartments() {
    let depts = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    });

    if (depts.length === 0) {
      const defaultDepts = [
        { name: 'Production & Manufacturing', code: 'PROD', description: 'Gauze weaving, bleaching, and converting floor' },
        { name: 'Packing & Packaging', code: 'PACK', description: 'Pouching, bundling, and box packaging' },
        { name: 'Quality Assurance & QC Lab', code: 'QC', description: 'Absorbency, GSM, and whiteness lab testing' },
        { name: 'Raw Material Store & Warehouse', code: 'WH', description: 'Bale storage and raw material inventory' },
        { name: 'Accounts & Finance', code: 'FIN', description: 'Payroll, invoicing, and ledger management' },
        { name: 'Human Resources & Admin', code: 'HR', description: 'Staffing, shift management, and employee welfare' },
      ];

      for (const d of defaultDepts) {
        await prisma.department.upsert({
          where: { code: d.code },
          update: {},
          create: d,
        });
      }
      depts = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    }

    return depts;
  }

  async createDepartment(data: { name: string; code?: string; description?: string }) {
    const code = data.code || data.name.substring(0, 6).toUpperCase().replace(/\s+/g, '');
    return prisma.department.create({
      data: {
        name: data.name,
        code,
        description: data.description || null,
      },
    });
  }

  async updateDepartment(id: string, data: { name?: string; code?: string; description?: string }) {
    return prisma.department.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.code ? { code: data.code } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
      },
    });
  }

  async deleteDepartment(id: string) {
    return prisma.department.delete({
      where: { id },
    });
  }

  /**
   * List or seed Designations
   */
  async getDesignations() {
    let desigs = await prisma.designation.findMany({
      orderBy: { name: 'asc' },
    });

    if (desigs.length === 0) {
      const defaultDesigs = [
        { name: 'Senior Machine Operator', code: 'SMO', description: 'Operates high-speed gauze looms and slitters' },
        { name: 'Floor Supervisor', code: 'SUP', description: 'Oversees daily shift output and safety' },
        { name: 'Packing Staff', code: 'PST', description: 'Assists in finished goods packaging' },
        { name: 'Quality Inspector', code: 'QCI', description: 'Performs chemical and physical test checks' },
        { name: 'Store Keeper', code: 'SKP', description: 'Manages warehouse receipt and issue' },
        { name: 'Senior Accountant', code: 'ACC', description: 'Handles payroll and GST compliance' },
      ];

      for (const d of defaultDesigs) {
        await prisma.designation.upsert({
          where: { code: d.code },
          update: {},
          create: d,
        });
      }
      desigs = await prisma.designation.findMany({ orderBy: { name: 'asc' } });
    }

    return desigs;
  }

  async createDesignation(data: { name: string; code?: string; description?: string }) {
    const code = data.code || data.name.substring(0, 6).toUpperCase().replace(/\s+/g, '');
    return prisma.designation.create({
      data: {
        name: data.name,
        code,
        description: data.description || null,
      },
    });
  }

  async updateDesignation(id: string, data: { name?: string; code?: string; description?: string }) {
    return prisma.designation.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.code ? { code: data.code } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
      },
    });
  }

  async deleteDesignation(id: string) {
    return prisma.designation.delete({
      where: { id },
    });
  }

  /**
   * Generate detailed attendance, overtime, work hours, and earnings report for employee
   */
  async getEmployeeReport(
    employeeId: string,
    query: { startDate?: string; endDate?: string; month?: number; year?: number },
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        department: true,
        designation: true,
        salaryStructure: true,
        advances: {
          orderBy: { createdAt: 'desc' },
        },
        salaryPayments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const now = new Date();
    let start: Date;
    let end: Date;

    if (query.startDate && query.endDate) {
      start = new Date(`${query.startDate}T00:00:00.000Z`);
      end = new Date(`${query.endDate}T23:59:59.999Z`);
    } else if (query.month && query.year) {
      const y = Number(query.year);
      const m = Number(query.month) - 1;
      start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
      end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
    } else if (query.startDate) {
      start = new Date(`${query.startDate}T00:00:00.000Z`);
      end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));
    } else {
      // Default to current month
      start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0));
      end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));
    }

    // Attendance records in date range
    const attendanceLogs = await prisma.attendanceLog.findMany({
      where: {
        employeeId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    let presentDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let leaveDays = 0;
    let totalWorkingHours = 0;
    let totalOvertimeHours = 0;
    let totalOtAmount = 0;

    for (const log of attendanceLogs) {
      if (log.status === 'PRESENT') presentDays += 1;
      else if (log.status === 'HALF_DAY') halfDays += 1;
      else if (log.status === 'ABSENT') absentDays += 1;
      else if (log.status === 'LEAVE') leaveDays += 1;

      totalWorkingHours += Number(log.workingHours || 0);
      totalOvertimeHours += Number(log.overtimeHours || 0);
      totalOtAmount += Number(log.otAmount || 0);
    }

    const baseWage = Number(employee.baseWage || (employee.salaryStructure ? employee.salaryStructure.baseSalary : 0));
    const otRatePerHour = Number(employee.otRatePerHour || 0);
    const payableDays = presentDays + 0.5 * halfDays;
    const baseSalaryEarned = Math.round(baseWage * payableDays * 100) / 100;
    const otSalaryEarned = Math.round(totalOvertimeHours * otRatePerHour * 100) / 100;
    const totalGrossEarned = Math.round((baseSalaryEarned + otSalaryEarned) * 100) / 100;

    // Filter advances in this range
    const periodAdvances = employee.advances.filter((a) => {
      const d = new Date(a.issueDate);
      return d >= start && d <= end;
    });
    const periodAdvanceGiven = periodAdvances.reduce((acc, a) => acc + Number(a.amount || 0), 0);

    // Active advance summary
    const activeAdvances = employee.advances.filter((a) => a.status === 'ACTIVE');
    const totalOutstandingAdvance = activeAdvances.reduce((acc, a) => acc + Number(a.balanceAmount || 0), 0);

    // Filter payments in this range
    const periodPayments = employee.salaryPayments.filter((p) => {
      const d = new Date(p.paymentDate);
      return d >= start && d <= end;
    });
    const totalDisbursedInPeriod = periodPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);

    // Daily log mapping
    const dailyLogs = attendanceLogs.map((l) => ({
      id: l.id,
      date: l.date.toISOString().split('T')[0],
      dayOfWeek: new Date(l.date).toLocaleDateString('en-IN', { weekday: 'short' }),
      status: l.status,
      checkIn: l.checkIn ? l.checkIn.toISOString() : null,
      checkOut: l.checkOut ? l.checkOut.toISOString() : null,
      workingHours: Number(l.workingHours || 0),
      overtimeHours: Number(l.overtimeHours || 0),
      otAmount: Number(l.otAmount || 0),
      remarks: l.remarks,
    }));

    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    const formatDatePretty = (dStr: string) => {
      const [year, month, day] = dStr.split('-').map(Number);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${String(day).padStart(2, '0')} ${months[month - 1]} ${year}`;
    };

    return {
      employee: {
        id: employee.id,
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
        phone: employee.phone,
        email: employee.email,
        department: employee.department?.name || 'Unassigned',
        designation: employee.designation?.name || 'Staff',
        joiningDate: employee.joiningDate,
        employmentType: employee.employmentType || 'Permanent',
        shift: employee.shift || 'General Day (09:00 - 18:30)',
        salaryType: employee.salaryType || 'Monthly Salary',
        salaryCycle: employee.salaryCycle || 'MONTHLY',
        baseWage,
        otRatePerHour,
        bankName: employee.bankName,
        bankAccountNo: employee.bankAccountNo,
        bankIfsc: employee.bankIfsc,
        panNo: employee.panNo,
        aadhaarNo: employee.aadhaarNo,
      },
      period: {
        startDate: startDateStr,
        endDate: endDateStr,
        totalCalendarDays: diffDays,
        formattedRange: `${formatDatePretty(startDateStr)} to ${formatDatePretty(endDateStr)}`,
      },

      attendanceSummary: {
        totalLoggedRecords: attendanceLogs.length,
        presentDays,
        halfDays,
        absentDays,
        leaveDays,
        payableDays,
        totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
        totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
      },
      financialSummary: {
        baseWage,
        otRatePerHour,
        payableDays,
        baseSalaryEarned,
        otSalaryEarned,
        totalGrossEarned,
        periodAdvanceGiven,
        totalOutstandingAdvance,
        totalDisbursedInPeriod,
      },
      dailyLogs,
      payments: periodPayments,
      advances: periodAdvances,
      generatedAt: new Date().toISOString(),
    };
  }
}

