import { Injectable } from '@nestjs/common';
import { prisma, AttendanceStatus, EmployeeStatus } from '@ims/database';

export interface CalculatedPayrollItem {
  employeeId: string;
  salaryType: string;
  baseWage: number;
  workingDaysInMonth: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  holidayCount: number;
  weeklyOffCount: number;
  payableDays: number;
  basicSalary: number;
  grossSalary: number;
  bonusAmount: number;
  incentiveAmount: number;
  lateDeduction: number;
  advanceDeduction: number;
  loanDeduction: number;
  pfDeduction: number;
  esiDeduction: number;
  professionalTax: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
}

@Injectable()
export class PayrollEngineService {
  /**
   * Calculates days in a given month/year
   */
  getDaysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Core Calculation Engine: Aggregates attendance logs & builds line items
   */
  async calculateMonthlyPayroll(month: number, year: number) {
    // 1. Fetch active employees
    const employees = await prisma.employee.findMany({
      where: {
        status: EmployeeStatus.ACTIVE,
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

    // Standard working days default to 26 for industrial ERP or total days
    const defaultWorkingDays = 26;

    const calculatedItems: CalculatedPayrollItem[] = [];

    for (const emp of employees) {
      // Fetch attendance logs for employee in this month
      const attendanceLogs = await prisma.attendanceLog.findMany({
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
          case AttendanceStatus.PRESENT:
            presentDays += 1;
            break;
          case AttendanceStatus.ABSENT:
            absentDays += 1;
            break;
          case AttendanceStatus.HALF_DAY:
            halfDays += 1;
            break;
          case AttendanceStatus.LEAVE:
            leaveDays += 1;
            break;
          case AttendanceStatus.HOLIDAY:
            holidayCount += 1;
            break;
          case AttendanceStatus.WEEKLY_OFF:
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
      } else {
        // Monthly Salary
        payableDays = presentDays + holidayCount + weeklyOffCount + leaveDays + 0.5 * halfDays;
        const dailyRate = baseWage / defaultWorkingDays;
        basicSalary = Math.round(dailyRate * payableDays * 100) / 100;
      }

      const initialGross = Math.round(basicSalary * 100) / 100;

      // Professional Tax (PT) Slabs
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
}
