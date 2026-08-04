"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollEngineService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@ims/database");
let PayrollEngineService = class PayrollEngineService {
    getDaysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }
    async calculateMonthlyPayroll(month, year) {
        const employees = await database_1.prisma.employee.findMany({
            where: {
                status: database_1.EmployeeStatus.ACTIVE,
                deletedAt: null,
            },
            include: {
                department: true,
                designation: true,
                salaryStructure: true,
            },
        });
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const totalDaysInMonth = this.getDaysInMonth(month, year);
        const endDate = new Date(Date.UTC(year, month - 1, totalDaysInMonth, 23, 59, 59, 999));
        const defaultWorkingDays = 26;
        const calculatedItems = [];
        for (const emp of employees) {
            const attendanceLogs = await database_1.prisma.attendanceLog.findMany({
                where: {
                    employeeId: emp.id,
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });
            let presentDays = 0;
            let absentDays = 0;
            let halfDays = 0;
            let leaveDays = 0;
            let holidayCount = 0;
            let weeklyOffCount = 0;
            for (const log of attendanceLogs) {
                switch (log.status) {
                    case database_1.AttendanceStatus.PRESENT:
                        presentDays += 1;
                        break;
                    case database_1.AttendanceStatus.ABSENT:
                        absentDays += 1;
                        break;
                    case database_1.AttendanceStatus.HALF_DAY:
                        halfDays += 1;
                        break;
                    case database_1.AttendanceStatus.LEAVE:
                        leaveDays += 1;
                        break;
                    case database_1.AttendanceStatus.HOLIDAY:
                        holidayCount += 1;
                        break;
                    case database_1.AttendanceStatus.WEEKLY_OFF:
                        weeklyOffCount += 1;
                        break;
                }
            }
            const salaryType = emp.salaryType || 'Monthly Salary';
            const baseWage = Number(emp.baseWage || (emp.salaryStructure ? emp.salaryStructure.baseSalary : 0));
            const pfDeduction = Number(emp.salaryStructure ? emp.salaryStructure.pfDeduction : 0);
            const esiDeduction = Number(emp.salaryStructure ? emp.salaryStructure.esiDeduction : 0);
            let payableDays = 0;
            let basicSalary = 0;
            if (salaryType === 'Daily Wage' || salaryType === 'Temporary Worker' || salaryType === 'Contract Employee') {
                payableDays = presentDays + 0.5 * halfDays;
                basicSalary = baseWage * payableDays;
            }
            else {
                payableDays = presentDays + holidayCount + weeklyOffCount + leaveDays + 0.5 * halfDays;
                const dailyRate = baseWage / defaultWorkingDays;
                basicSalary = Math.round(dailyRate * payableDays * 100) / 100;
            }
            const initialGross = Math.round(basicSalary * 100) / 100;
            let professionalTax = 0;
            if (initialGross > 15000) {
                professionalTax = 200;
            }
            const bonusAmount = 0;
            const incentiveAmount = 0;
            const lateDeduction = 0;
            const advanceDeduction = 0;
            const loanDeduction = 0;
            const otherDeductions = 0;
            const totalDeductions = Math.round((pfDeduction + esiDeduction + professionalTax + lateDeduction + advanceDeduction + loanDeduction + otherDeductions) * 100) / 100;
            const netSalary = Math.max(0, Math.round((initialGross + bonusAmount + incentiveAmount - totalDeductions) * 100) / 100);
            calculatedItems.push({
                employeeId: emp.id,
                salaryType,
                baseWage,
                workingDaysInMonth: defaultWorkingDays,
                presentDays,
                absentDays,
                halfDays,
                leaveDays,
                holidayCount,
                weeklyOffCount,
                payableDays,
                basicSalary,
                grossSalary: initialGross,
                bonusAmount,
                incentiveAmount,
                lateDeduction,
                advanceDeduction,
                loanDeduction,
                pfDeduction,
                esiDeduction,
                professionalTax,
                otherDeductions,
                totalDeductions,
                netSalary,
            });
        }
        return calculatedItems;
    }
};
exports.PayrollEngineService = PayrollEngineService;
exports.PayrollEngineService = PayrollEngineService = __decorate([
    (0, common_1.Injectable)()
], PayrollEngineService);
//# sourceMappingURL=payroll-engine.service.js.map