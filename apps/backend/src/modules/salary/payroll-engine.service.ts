import { Injectable } from '@nestjs/common';
import { prisma, AttendanceStatus, EmployeeStatus } from '@ims/database';

export interface CalculatedPayrollItem {
  employeeId: string;
  salaryType: string;
  periodType: string; // MONTHLY, WEEKLY
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
  overtimeHours: number;
  overtimeRate: number;
  overtimeSalary: number;
  shortageHours: number;
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
   * Core Calculation Engine: Aggregates attendance logs & builds line items for MONTHLY payroll
   */
  async calculateMonthlyPayroll(month: number, year: number) {
    const employees = await prisma.employee.findMany({
      where: {
        status: EmployeeStatus.ACTIVE,
        deletedAt: null,
      },
      include: {
        department: true,
        designation: true,
        salaryStructure: true,
        advances: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const totalDaysInMonth = this.getDaysInMonth(month, year);
    const endDate = new Date(Date.UTC(year, month - 1, totalDaysInMonth, 23, 59, 59, 999));

    const defaultWorkingDays = 26;
    const calculatedItems: CalculatedPayrollItem[] = [];

    // Batch fetch all attendance logs for the entire cohort in the date range (eliminates N+1)
    const employeeIds = employees.map((e) => e.id);
    const allAttendanceLogs = await prisma.attendanceLog.findMany({
      where: {
        employeeId: { in: employeeIds },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const logsByEmployee = new Map<string, typeof allAttendanceLogs>();
    for (const log of allAttendanceLogs) {
      const list = logsByEmployee.get(log.employeeId) || [];
      list.push(log);
      logsByEmployee.set(log.employeeId, list);
    }

    for (const emp of employees) {
      const attendanceLogs = logsByEmployee.get(emp.id) || [];

      let presentDays = 0;
      let absentDays = 0;
      let halfDays = 0;
      let leaveDays = 0;
      let holidayCount = 0;
      let weeklyOffCount = 0;
      let totalOvertimeHours = 0;
      let totalShortageHours = 0;

      for (const log of attendanceLogs) {
        totalOvertimeHours += Number(log.overtimeHours || 0);
        totalShortageHours += Number((log as any).shortageHours || 0);

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
      const otRatePerHour = Number(emp.otRatePerHour || 0);

      const pfDeduction = Number(emp.salaryStructure ? emp.salaryStructure.pfDeduction : 0);
      const esiDeduction = Number(emp.salaryStructure ? emp.salaryStructure.esiDeduction : 0);

      const payableDays = presentDays + 0.5 * halfDays;

      // Prorate monthly wage based on standard working days in month (or multiply for daily rate)
      const isDailyWage = salaryType.toLowerCase().includes('daily') || (salaryType.toLowerCase().includes('wage') && !salaryType.toLowerCase().includes('monthly'));
      const basicSalary = isDailyWage
        ? Math.round(baseWage * payableDays * 100) / 100
        : Math.round(((baseWage / (defaultWorkingDays || 26)) * payableDays) * 100) / 100;

      const overtimeSalary = Math.round(totalOvertimeHours * otRatePerHour * 100) / 100;
      const initialGross = Math.round((basicSalary + overtimeSalary) * 100) / 100;

      // Professional Tax (PT) Slabs
      let professionalTax = 0;
      if (initialGross > 15000) {
        professionalTax = 200;
      }

      // Advance deduction calculation from active advances
      let advanceDeduction = 0;
      if (emp.advances && emp.advances.length > 0) {
        for (const adv of emp.advances) {
          const bal = Number(adv.balanceAmount);
          const weeklyDed = Number(adv.weeklyDeduction);
          // For monthly, 4 weeks of deduction or total balance
          const monthlyDed = weeklyDed > 0 ? weeklyDed * 4 : bal;
          advanceDeduction += Math.min(bal, monthlyDed);
        }
      }

      const bonusAmount = 0;
      const incentiveAmount = 0;
      // Proportional deduction for working less than 8.5h shift (Daily wage / 8.5) without fixed penalty
      const dailyRate = isDailyWage ? baseWage : (baseWage / (defaultWorkingDays || 26));
      const hourlyRate = dailyRate > 0 ? (dailyRate / 8.5) : 0;
      const lateDeduction = Math.round(totalShortageHours * hourlyRate * 100) / 100;
      const loanDeduction = 0;
      const otherDeductions = 0;

      const totalDeductions = Math.round((pfDeduction + esiDeduction + professionalTax + lateDeduction + advanceDeduction + loanDeduction + otherDeductions) * 100) / 100;
      const netSalary = Math.max(0, Math.round((initialGross + bonusAmount + incentiveAmount - totalDeductions) * 100) / 100);

      calculatedItems.push({
        employeeId: emp.id,
        salaryType,
        periodType: 'MONTHLY',
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
        overtimeHours: Math.round(totalOvertimeHours * 100) / 100,
        overtimeRate: otRatePerHour,
        overtimeSalary,
        shortageHours: Math.round(totalShortageHours * 100) / 100,
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

  /**
   * Calculation Engine for WEEKLY payroll (Saturday salary day)
   */
  async calculateWeeklyPayroll(weekNumber?: number, startDateStr?: string, endDateStr?: string) {
    const employees = await prisma.employee.findMany({
      where: {
        status: EmployeeStatus.ACTIVE,
        deletedAt: null,
      },
      include: {
        department: true,
        designation: true,
        salaryStructure: true,
        advances: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    let startDate: Date;
    let endDate: Date;

    if (startDateStr && endDateStr) {
      startDate = new Date(startDateStr);
      endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Calculate current week ending Saturday
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToSaturday = (6 - dayOfWeek + 7) % 7;
      const saturday = new Date(now);
      saturday.setDate(now.getDate() + diffToSaturday);
      saturday.setHours(23, 59, 59, 999);

      const monday = new Date(saturday);
      monday.setDate(saturday.getDate() - 5);
      monday.setHours(0, 0, 0, 0);

      startDate = monday;
      endDate = saturday;
    }

    const workingDaysInWeek = 6;
    const calculatedItems: CalculatedPayrollItem[] = [];

    // Batch fetch attendance logs for all employees for the week
    const employeeIds = employees.map((e) => e.id);
    const allAttendanceLogs = await prisma.attendanceLog.findMany({
      where: {
        employeeId: { in: employeeIds },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const logsByEmployee = new Map<string, typeof allAttendanceLogs>();
    for (const log of allAttendanceLogs) {
      const list = logsByEmployee.get(log.employeeId) || [];
      list.push(log);
      logsByEmployee.set(log.employeeId, list);
    }

    for (const emp of employees) {
      const attendanceLogs = logsByEmployee.get(emp.id) || [];

      let presentDays = 0;
      let absentDays = 0;
      let halfDays = 0;
      let leaveDays = 0;
      let holidayCount = 0;
      let weeklyOffCount = 0;
      let totalOvertimeHours = 0;
      let totalShortageHours = 0;

      for (const log of attendanceLogs) {
        totalOvertimeHours += Number(log.overtimeHours || 0);
        totalShortageHours += Number((log as any).shortageHours || 0);

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

      const salaryType = emp.salaryType || 'Weekly Wage';
      const baseWage = Number(emp.baseWage || (emp.salaryStructure ? emp.salaryStructure.baseSalary : 0));
      const otRatePerHour = Number(emp.otRatePerHour || 0);

      const payableDays = presentDays + 0.5 * halfDays;

      // In weekly payroll, check if baseWage represents daily or weekly rate
      const isDailyWage = salaryType.toLowerCase().includes('daily') || (!salaryType.toLowerCase().includes('monthly') && !salaryType.toLowerCase().includes('weekly'));
      const basicSalary = isDailyWage
        ? Math.round(baseWage * payableDays * 100) / 100
        : Math.round(((baseWage / workingDaysInWeek) * payableDays) * 100) / 100;

      const overtimeSalary = Math.round(totalOvertimeHours * otRatePerHour * 100) / 100;
      const initialGross = Math.round((basicSalary + overtimeSalary) * 100) / 100;

      // Active weekly advance deductions
      let advanceDeduction = 0;
      if (emp.advances && emp.advances.length > 0) {
        for (const adv of emp.advances) {
          const bal = Number(adv.balanceAmount);
          const weeklyDed = Number(adv.weeklyDeduction);
          const ded = weeklyDed > 0 ? weeklyDed : bal;
          advanceDeduction += Math.min(bal, ded);
        }
      }

      const bonusAmount = 0;
      const incentiveAmount = 0;
      // Proportional deduction for working less than 8.5h shift (Daily wage / 8.5) without fixed penalty
      const dailyRate = isDailyWage ? baseWage : (baseWage / workingDaysInWeek);
      const hourlyRate = dailyRate > 0 ? (dailyRate / 8.5) : 0;
      const lateDeduction = Math.round(totalShortageHours * hourlyRate * 100) / 100;
      const loanDeduction = 0;
      const pfDeduction = 0;
      const esiDeduction = 0;
      const professionalTax = 0;
      const otherDeductions = 0;

      const totalDeductions = Math.round((advanceDeduction + lateDeduction + otherDeductions) * 100) / 100;
      const netSalary = Math.max(0, Math.round((initialGross + bonusAmount + incentiveAmount - totalDeductions) * 100) / 100);

      calculatedItems.push({
        employeeId: emp.id,
        salaryType,
        periodType: 'WEEKLY',
        baseWage,
        workingDaysInMonth: workingDaysInWeek,
        presentDays,
        absentDays,
        halfDays,
        leaveDays,
        holidayCount,
        weeklyOffCount,
        payableDays,
        basicSalary,
        overtimeHours: Math.round(totalOvertimeHours * 100) / 100,
        overtimeRate: otRatePerHour,
        overtimeSalary,
        shortageHours: Math.round(totalShortageHours * 100) / 100,
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
