"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@ims/database");
const payroll_engine_service_1 = require("./payroll-engine.service");
let SalaryService = class SalaryService {
    constructor(payrollEngine) {
        this.payrollEngine = payrollEngine;
    }
    async getDashboardSummary() {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const [totalRuns, pendingRuns, approvedRuns, currentRun] = await Promise.all([
            database_1.prisma.payrollRun.count(),
            database_1.prisma.payrollRun.count({ where: { status: { in: [database_1.PayrollStatus.DRAFT, database_1.PayrollStatus.PENDING_APPROVAL] } } }),
            database_1.prisma.payrollRun.count({ where: { status: database_1.PayrollStatus.APPROVED } }),
            database_1.prisma.payrollRun.findUnique({
                where: { month_year: { month: currentMonth, year: currentYear } },
                include: { items: true },
            }),
        ]);
        const activeEmployeesCount = await database_1.prisma.employee.count({
            where: { status: 'ACTIVE', deletedAt: null },
        });
        const aggregates = await database_1.prisma.payrollRun.aggregate({
            _sum: {
                totalGross: true,
                totalDeductions: true,
                totalBonus: true,
                totalNet: true,
            },
        });
        const departmentBreakdown = await database_1.prisma.employee.groupBy({
            by: ['departmentId'],
            where: { status: 'ACTIVE', deletedAt: null },
            _sum: { baseWage: true },
            _count: { id: true },
        });
        const departmentIds = departmentBreakdown.map((d) => d.departmentId).filter(Boolean);
        const departments = await database_1.prisma.department.findMany({
            where: { id: { in: departmentIds } },
        });
        const deptMap = new Map(departments.map((d) => [d.id, d.name]));
        const formattedDeptBreakdown = departmentBreakdown.map((item) => ({
            departmentName: item.departmentId ? deptMap.get(item.departmentId) || 'Unassigned' : 'Unassigned',
            employeeCount: item._count.id,
            totalBaseWage: Number(item._sum.baseWage || 0),
        }));
        const recentRuns = await database_1.prisma.payrollRun.findMany({
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
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.month)
            where.month = Number(query.month);
        if (query.year)
            where.year = Number(query.year);
        if (query.status && query.status !== 'ALL')
            where.status = query.status;
        const [items, total] = await Promise.all([
            database_1.prisma.payrollRun.findMany({
                where,
                include: {
                    generatedByUser: { select: { id: true, email: true } },
                    approvedByUser: { select: { id: true, email: true } },
                },
                orderBy: [{ year: 'desc' }, { month: 'desc' }],
                skip,
                take: limit,
            }),
            database_1.prisma.payrollRun.count({ where }),
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
    async findOne(id) {
        const run = await database_1.prisma.payrollRun.findUnique({
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
            throw new common_1.NotFoundException(`Payroll run with ID ${id} not found`);
        }
        return run;
    }
    async generatePayroll(dto, userId) {
        const existingRun = await database_1.prisma.payrollRun.findUnique({
            where: { month_year: { month: dto.month, year: dto.year } },
        });
        if (existingRun && existingRun.status !== database_1.PayrollStatus.CANCELLED) {
            throw new common_1.BadRequestException(`Payroll run for ${dto.month}/${dto.year} already exists with status ${existingRun.status}`);
        }
        const calculatedItems = await this.payrollEngine.calculateMonthlyPayroll(dto.month, dto.year);
        if (calculatedItems.length === 0) {
            throw new common_1.BadRequestException('No active employees found to generate payroll');
        }
        const monthStr = String(dto.month).padStart(2, '0');
        const payrollCode = `PAY-${dto.year}-${monthStr}`;
        let totalGross = 0;
        let totalDeductions = 0;
        let totalBonus = 0;
        let totalNet = 0;
        for (const item of calculatedItems) {
            totalGross += item.grossSalary;
            totalDeductions += item.totalDeductions;
            totalBonus += item.bonusAmount;
            totalNet += item.netSalary;
        }
        const payrollRun = await database_1.prisma.$transaction(async (tx) => {
            if (existingRun && existingRun.status === database_1.PayrollStatus.CANCELLED) {
                await tx.payrollRun.delete({ where: { id: existingRun.id } });
            }
            const run = await tx.payrollRun.create({
                data: {
                    payrollCode,
                    month: dto.month,
                    year: dto.year,
                    totalEmployees: calculatedItems.length,
                    totalGross,
                    totalDeductions,
                    totalBonus,
                    totalNet,
                    status: database_1.PayrollStatus.DRAFT,
                    remarks: dto.remarks,
                    generatedByUserId: userId,
                },
            });
            await tx.payrollItem.createMany({
                data: calculatedItems.map((item) => ({
                    payrollRunId: run.id,
                    employeeId: item.employeeId,
                    salaryType: item.salaryType,
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
                    status: database_1.PayrollStatus.DRAFT,
                })),
            });
            await tx.auditLog.create({
                data: {
                    action: 'PAYROLL_GENERATED',
                    entityName: 'PayrollRun',
                    entityId: run.id,
                    newValues: { payrollCode, month: dto.month, year: dto.year, count: calculatedItems.length, totalNet },
                    userId,
                },
            });
            return run;
        });
        return this.findOne(payrollRun.id);
    }
    async updatePayrollItemAdjustment(itemId, dto, userId) {
        const item = await database_1.prisma.payrollItem.findUnique({
            where: { id: itemId },
            include: { payrollRun: true },
        });
        if (!item) {
            throw new common_1.NotFoundException(`Payroll item ${itemId} not found`);
        }
        if (item.payrollRun.status === database_1.PayrollStatus.APPROVED || item.payrollRun.status === database_1.PayrollStatus.PAID) {
            throw new common_1.BadRequestException('Cannot edit adjustments on an approved or paid payroll');
        }
        const bonusAmount = dto.bonusAmount !== undefined ? dto.bonusAmount : Number(item.bonusAmount);
        const incentiveAmount = dto.incentiveAmount !== undefined ? dto.incentiveAmount : Number(item.incentiveAmount);
        const lateDeduction = dto.lateDeduction !== undefined ? dto.lateDeduction : Number(item.lateDeduction);
        const advanceDeduction = dto.advanceDeduction !== undefined ? dto.advanceDeduction : Number(item.advanceDeduction);
        const loanDeduction = dto.loanDeduction !== undefined ? dto.loanDeduction : Number(item.loanDeduction);
        const pfDeduction = dto.pfDeduction !== undefined ? dto.pfDeduction : Number(item.pfDeduction);
        const esiDeduction = dto.esiDeduction !== undefined ? dto.esiDeduction : Number(item.esiDeduction);
        const professionalTax = dto.professionalTax !== undefined ? dto.professionalTax : Number(item.professionalTax);
        const otherDeductions = dto.otherDeductions !== undefined ? dto.otherDeductions : Number(item.otherDeductions);
        const grossSalary = Number(item.basicSalary) + bonusAmount + incentiveAmount;
        const totalDeductions = lateDeduction + advanceDeduction + loanDeduction + pfDeduction + esiDeduction + professionalTax + otherDeductions;
        const netSalary = Math.max(0, grossSalary - totalDeductions);
        const updatedItem = await database_1.prisma.$transaction(async (tx) => {
            const res = await tx.payrollItem.update({
                where: { id: itemId },
                data: {
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
            const items = await tx.payrollItem.findMany({
                where: { payrollRunId: item.payrollRunId },
            });
            const totalGross = items.reduce((acc, i) => acc + Number(i.grossSalary), 0);
            const totalDeductionsSum = items.reduce((acc, i) => acc + Number(i.totalDeductions), 0);
            const totalBonusSum = items.reduce((acc, i) => acc + Number(i.bonusAmount), 0);
            const totalNetSum = items.reduce((acc, i) => acc + Number(i.netSalary), 0);
            await tx.payrollRun.update({
                where: { id: item.payrollRunId },
                data: {
                    totalGross,
                    totalDeductions: totalDeductionsSum,
                    totalBonus: totalBonusSum,
                    totalNet: totalNetSum,
                },
            });
            await tx.auditLog.create({
                data: {
                    action: 'PAYROLL_ITEM_UPDATED',
                    entityName: 'PayrollItem',
                    entityId: itemId,
                    oldValues: { netSalary: Number(item.netSalary) },
                    newValues: { netSalary, bonusAmount, totalDeductions },
                    userId,
                },
            });
            return res;
        });
        return updatedItem;
    }
    async approvePayroll(id, userId) {
        const run = await database_1.prisma.payrollRun.findUnique({
            where: { id },
            include: { items: { include: { employee: true } } },
        });
        if (!run) {
            throw new common_1.NotFoundException(`Payroll run ${id} not found`);
        }
        if (run.status === database_1.PayrollStatus.APPROVED || run.status === database_1.PayrollStatus.PAID) {
            throw new common_1.BadRequestException('Payroll run is already approved or paid');
        }
        const approvedRun = await database_1.prisma.$transaction(async (tx) => {
            const updated = await tx.payrollRun.update({
                where: { id },
                data: {
                    status: database_1.PayrollStatus.APPROVED,
                    approvedAt: new Date(),
                    approvedByUserId: userId,
                },
            });
            for (const item of run.items) {
                await tx.payrollItem.update({
                    where: { id: item.id },
                    data: { status: database_1.PayrollStatus.APPROVED },
                });
                const slipNumber = `SLIP-${run.year}${String(run.month).padStart(2, '0')}-${item.employee.employeeCode}`;
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
                    newValues: { payrollCode: run.payrollCode, status: database_1.PayrollStatus.APPROVED },
                    userId,
                },
            });
            return updated;
        });
        return this.findOne(approvedRun.id);
    }
    async cancelPayroll(id, userId) {
        const run = await database_1.prisma.payrollRun.findUnique({ where: { id } });
        if (!run)
            throw new common_1.NotFoundException(`Payroll run ${id} not found`);
        if (run.status === database_1.PayrollStatus.PAID) {
            throw new common_1.BadRequestException('Cannot cancel a fully paid payroll run');
        }
        const cancelledRun = await database_1.prisma.$transaction(async (tx) => {
            const res = await tx.payrollRun.update({
                where: { id },
                data: { status: database_1.PayrollStatus.CANCELLED },
            });
            await tx.payrollItem.updateMany({
                where: { payrollRunId: id },
                data: { status: database_1.PayrollStatus.CANCELLED },
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
    async recordPayment(dto, userId) {
        const item = await database_1.prisma.payrollItem.findUnique({
            where: { id: dto.payrollItemId },
            include: { payrollRun: true, employee: true },
        });
        if (!item)
            throw new common_1.NotFoundException(`Payroll item ${dto.payrollItemId} not found`);
        if (item.payrollRun.status === database_1.PayrollStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot record payment for a cancelled payroll run');
        }
        const payment = await database_1.prisma.$transaction(async (tx) => {
            const p = await tx.salaryPayment.create({
                data: {
                    payrollItemId: dto.payrollItemId,
                    employeeId: item.employeeId,
                    amount: dto.amount,
                    paymentMethod: dto.paymentMethod,
                    transactionRef: dto.transactionRef,
                    remarks: dto.remarks,
                    paidByUserId: userId,
                },
            });
            await tx.payrollItem.update({
                where: { id: dto.payrollItemId },
                data: { status: database_1.PayrollStatus.PAID },
            });
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
            const unpaidCount = await tx.payrollItem.count({
                where: {
                    payrollRunId: item.payrollRunId,
                    status: { not: database_1.PayrollStatus.PAID },
                },
            });
            if (unpaidCount === 0) {
                await tx.payrollRun.update({
                    where: { id: item.payrollRunId },
                    data: { status: database_1.PayrollStatus.PAID },
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
    async getSalarySlip(itemId) {
        const item = await database_1.prisma.payrollItem.findUnique({
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
        if (!item)
            throw new common_1.NotFoundException(`Payroll item ${itemId} not found`);
        return item;
    }
    async getSalaryHistory(employeeId, year) {
        const where = {};
        if (employeeId)
            where.employeeId = employeeId;
        if (year)
            where.year = Number(year);
        return database_1.prisma.salaryHistory.findMany({
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
};
exports.SalaryService = SalaryService;
exports.SalaryService = SalaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payroll_engine_service_1.PayrollEngineService])
], SalaryService);
//# sourceMappingURL=salary.service.js.map