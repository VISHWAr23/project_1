import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, AttendanceStatus, EmployeeStatus } from '@ims/database';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  /**
   * Helper to format date string to pure YYYY-MM-DD Date object
   */
  private parseDate(dateStr: string): Date {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      throw new BadRequestException(`Invalid date format: ${dateStr}`);
    }
    // Zero out time components to avoid timezone offsets
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  }

  /**
   * Helper to validate no future date
   */
  private validateNotFutureDate(date: Date) {
    const today = new Date();
    const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    if (date.getTime() > todayUtc.getTime()) {
      throw new BadRequestException('Future dates are not allowed for attendance logging');
    }
  }

  /**
   * Helper: Auto-calculate working hours & overtime from checkIn/checkOut/lunch
   * Standard Shift: 9:00 AM to 6:30 PM (8.5 hrs regular work + 1 hr lunch 1:30 PM - 2:30 PM)
   */
  private calculateHours(
    checkInStr?: string | null,
    checkOutStr?: string | null,
    lunchStartStr?: string | null,
    lunchEndStr?: string | null,
    status?: AttendanceStatus,
    otRatePerHour: number = 0,
  ) {
    if (
      status === AttendanceStatus.ABSENT ||
      status === AttendanceStatus.LEAVE ||
      status === AttendanceStatus.HOLIDAY ||
      status === AttendanceStatus.WEEKLY_OFF
    ) {
      return { workingHours: 0, overtimeHours: 0, shortageHours: 0, otAmount: 0 };
    }

    const standardRegularHours = status === AttendanceStatus.HALF_DAY ? 4.25 : 8.5;

    if (!checkInStr || !checkOutStr) {
      return { workingHours: standardRegularHours, overtimeHours: 0, shortageHours: 0, otAmount: 0 };
    }

    try {
      const inDate = new Date(checkInStr);
      const outDate = new Date(checkOutStr);

      if (outDate.getTime() > inDate.getTime()) {
        const totalElapsedMinutes = (outDate.getTime() - inDate.getTime()) / (1000 * 60);

        // Calculate lunch break deduction
        let lunchMinutes = 0;
        if (lunchStartStr && lunchEndStr) {
          const lStart = new Date(lunchStartStr).getTime();
          const lEnd = new Date(lunchEndStr).getTime();
          if (lEnd > lStart && lEnd <= outDate.getTime() && lStart >= inDate.getTime()) {
            lunchMinutes = (lEnd - lStart) / (1000 * 60);
          }
        } else if (totalElapsedMinutes >= 330) {
          // Standard lunch break deduction if shift is >= 5.5 hours
          lunchMinutes = 60;
        }

        const netWorkedMinutes = Math.max(0, totalElapsedMinutes - lunchMinutes);
        const netWorkedHours = Math.round((netWorkedMinutes / 60) * 100) / 100;

        if (netWorkedHours >= standardRegularHours) {
          const workingHours = standardRegularHours;
          const overtimeHours = Math.max(0, Math.round((netWorkedHours - standardRegularHours) * 100) / 100);
          const otAmount = Math.round(overtimeHours * otRatePerHour * 100) / 100;
          return { workingHours, overtimeHours, shortageHours: 0, otAmount };
        } else {
          // Employee worked less than standard regular hours (8.5 hrs or 4.25 hrs for half day)
          const shortageHours = Math.max(0, Math.round((standardRegularHours - netWorkedHours) * 100) / 100);
          return { workingHours: netWorkedHours, overtimeHours: 0, shortageHours, otAmount: 0 };
        }
      }
    } catch {
      // Fallback
    }

    return { workingHours: standardRegularHours, overtimeHours: 0, shortageHours: 0, otAmount: 0 };
  }

  /**
   * List all attendance logs with filters & pagination
   */
  async findAll(query: {
    date?: string;
    search?: string;
    departmentId?: string;
    status?: AttendanceStatus | string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 30;
    const skip = (page - 1) * limit;

    const where: any = {
      employee: {
        deletedAt: null,
      },
    };

    if (query.date) {
      where.date = this.parseDate(query.date);
    } else {
      // Default to today's date
      const today = new Date();
      where.date = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    }

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.departmentId && query.departmentId !== 'ALL') {
      where.employee = {
        ...where.employee,
        departmentId: query.departmentId,
      };
    }

    if (query.search) {
      const searchLower = query.search.trim();
      where.employee = {
        ...where.employee,
        OR: [
          { firstName: { contains: searchLower, mode: 'insensitive' } },
          { lastName: { contains: searchLower, mode: 'insensitive' } },
          { employeeCode: { contains: searchLower, mode: 'insensitive' } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      prisma.attendanceLog.findMany({
        where,
        include: {
          employee: {
            include: {
              department: true,
              designation: true,
            },
          },
        },
        orderBy: { employee: { firstName: 'asc' } },
        skip,
        take: limit,
      }),
      prisma.attendanceLog.count({ where }),
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
   * Get Today's Attendance Dashboard KPI Stats
   */
  async getTodaySummary(targetDateStr?: string) {
    const today = targetDateStr ? this.parseDate(targetDateStr) : new Date();
    const dateUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    const activeEmployeesCount = await prisma.employee.count({
      where: { deletedAt: null, status: EmployeeStatus.ACTIVE },
    });

    const logs = await prisma.attendanceLog.findMany({
      where: {
        date: dateUtc,
        employee: { deletedAt: null },
      },
      select: { status: true, workingHours: true, overtimeHours: true, shortageHours: true, otAmount: true },
    });

    const presentCount = logs.filter((l) => l.status === AttendanceStatus.PRESENT).length;
    const absentCount = logs.filter((l) => l.status === AttendanceStatus.ABSENT).length;
    const halfDayCount = logs.filter((l) => l.status === AttendanceStatus.HALF_DAY).length;
    const leaveCount = logs.filter((l) => l.status === AttendanceStatus.LEAVE).length;
    const unmarkedCount = Math.max(0, activeEmployeesCount - logs.length);
    const totalOvertimeHours = logs.reduce((acc, l) => acc + Number(l.overtimeHours || 0), 0);
    const totalShortageHours = logs.reduce((acc, l) => acc + Number(l.shortageHours || 0), 0);
    const totalOvertimeAmount = logs.reduce((acc, l) => acc + Number(l.otAmount || 0), 0);

    return {
      date: dateUtc.toISOString().split('T')[0],
      totalActiveEmployees: activeEmployeesCount,
      presentToday: presentCount,
      absentToday: absentCount,
      halfDayToday: halfDayCount,
      leaveToday: leaveCount,
      unmarkedToday: unmarkedCount,
      totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
      totalShortageHours: Math.round(totalShortageHours * 100) / 100,
      totalOvertimeAmount: Math.round(totalOvertimeAmount * 100) / 100,
    };
  }

  /**
   * Get Monthly Attendance Summary for Calendar View & Payroll Preparation
   */
  async getMonthSummary(month: number, year: number, departmentId?: string) {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));

    const empWhere: any = { deletedAt: null, status: EmployeeStatus.ACTIVE };
    if (departmentId && departmentId !== 'ALL') {
      empWhere.departmentId = departmentId;
    }

    const employees = await prisma.employee.findMany({
      where: empWhere,
      include: {
        department: true,
        designation: true,
        attendanceLogs: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    const summary = employees.map((emp) => {
      const logs = emp.attendanceLogs;
      const totalPresent = logs.filter((l) => l.status === AttendanceStatus.PRESENT).length;
      const totalAbsent = logs.filter((l) => l.status === AttendanceStatus.ABSENT).length;
      const totalHalfDay = logs.filter((l) => l.status === AttendanceStatus.HALF_DAY).length;
      const totalLeave = logs.filter((l) => l.status === AttendanceStatus.LEAVE).length;
      const totalWorkingHours = logs.reduce((acc, l) => acc + Number(l.workingHours || 0), 0);
      const totalOvertimeHours = logs.reduce((acc, l) => acc + Number(l.overtimeHours || 0), 0);
      const totalShortageHours = logs.reduce((acc, l) => acc + Number(l.shortageHours || 0), 0);
      const totalOtAmount = logs.reduce((acc, l) => acc + Number(l.otAmount || 0), 0);

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department?.name || 'Unassigned',
        designation: emp.designation?.name || 'Staff',
        otRatePerHour: Number(emp.otRatePerHour || 0),
        salaryCycle: emp.salaryCycle || 'MONTHLY',
        totalPresent,
        totalAbsent,
        totalHalfDay,
        totalLeave,
        totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
        totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
        totalShortageHours: Math.round(totalShortageHours * 100) / 100,
        totalOtAmount: Math.round(totalOtAmount * 100) / 100,
        logs: logs.map((l) => ({
          date: l.date.toISOString().split('T')[0],
          status: l.status,
          workingHours: Number(l.workingHours || 0),
          overtimeHours: Number(l.overtimeHours || 0),
          shortageHours: Number(l.shortageHours || 0),
          otAmount: Number(l.otAmount || 0),
          checkIn: l.checkIn,
          checkOut: l.checkOut,
          lunchStart: l.lunchStart,
          lunchEnd: l.lunchEnd,
        })),
      };
    });

    return {
      month,
      year,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      employees: summary,
    };
  }

  /**
   * Get attendance history for a single employee
   */
  async getEmployeeAttendance(employeeId: string, startDateStr?: string, endDateStr?: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const where: any = { employeeId };
    if (startDateStr && endDateStr) {
      where.date = {
        gte: this.parseDate(startDateStr),
        lte: this.parseDate(endDateStr),
      };
    }

    const logs = await prisma.attendanceLog.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return {
      employee: {
        id: employee.id,
        code: employee.employeeCode,
        name: `${employee.firstName} ${employee.lastName}`,
        otRatePerHour: Number(employee.otRatePerHour || 0),
        salaryCycle: employee.salaryCycle || 'MONTHLY',
      },
      logs,
    };
  }

  /**
   * Mark / Upsert Single Attendance Record
   */
  async create(dto: CreateAttendanceDto, userId?: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: dto.employeeId, deletedAt: null },
    });

    if (!employee) {
      throw new BadRequestException('Employee not found or is soft-deleted');
    }

    if (employee.status !== EmployeeStatus.ACTIVE) {
      throw new BadRequestException(`Cannot log attendance for ${employee.status} employee`);
    }

    const dateStr = dto.date || new Date().toISOString().split('T')[0];
    const date = this.parseDate(dateStr);
    this.validateNotFutureDate(date);

    const checkIn = dto.checkIn ? new Date(dto.checkIn) : null;
    const checkOut = dto.checkOut ? new Date(dto.checkOut) : null;
    const lunchStart = dto.lunchStart ? new Date(dto.lunchStart) : null;
    const lunchEnd = dto.lunchEnd ? new Date(dto.lunchEnd) : null;

    const empOtRate = Number(employee.otRatePerHour || 0);
    const computed = this.calculateHours(dto.checkIn, dto.checkOut, dto.lunchStart, dto.lunchEnd, dto.status, empOtRate);
    
    const workingHours = dto.workingHours !== undefined ? dto.workingHours : computed.workingHours;
    const overtimeHours = dto.overtimeHours !== undefined ? dto.overtimeHours : computed.overtimeHours;
    const shortageHours = dto.shortageHours !== undefined ? dto.shortageHours : computed.shortageHours;
    const otAmount = dto.otAmount !== undefined ? dto.otAmount : computed.otAmount;

    const record = await prisma.attendanceLog.upsert({
      where: {
        employeeId_date: {
          employeeId: dto.employeeId,
          date,
        },
      },
      update: {
        status: dto.status,
        checkIn,
        checkOut,
        lunchStart,
        lunchEnd,
        workingHours,
        overtimeHours,
        shortageHours,
        otAmount,
        remarks: dto.remarks,
        createdByUserId: userId || null,
      },
      create: {
        employeeId: dto.employeeId,
        date,
        status: dto.status,
        checkIn,
        checkOut,
        lunchStart,
        lunchEnd,
        workingHours,
        overtimeHours,
        shortageHours,
        otAmount,
        remarks: dto.remarks,
        createdByUserId: userId || null,
      },
      include: {
        employee: true,
      },
    });

    // Write Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'LOG_ATTENDANCE',
          entityName: 'AttendanceLog',
          entityId: record.id,
          newValues: record as any,
          userId: userId || null,
        },
      });
    } catch {
      // Audit log non-blocking
    }

    return record;
  }

  /**
   * Process Bulk Attendance Marking for a Given Date
   */
  async bulkCreate(dto: BulkAttendanceDto, userId?: string) {
    const date = this.parseDate(dto.date);
    this.validateNotFutureDate(date);

    const results = [];
    for (const item of dto.records) {
      try {
        const res = await this.create(
          {
            employeeId: item.employeeId,
            date: dto.date,
            status: item.status,
            checkIn: item.checkIn,
            checkOut: item.checkOut,
            lunchStart: item.lunchStart,
            lunchEnd: item.lunchEnd,
            workingHours: item.workingHours,
            overtimeHours: item.overtimeHours,
            shortageHours: item.shortageHours,
            otAmount: item.otAmount,
            remarks: item.remarks,
          },
          userId
        );
        results.push(res);
      } catch (err: any) {
        // Skip failed individual entries or record error
      }
    }

    return {
      message: `Successfully processed ${results.length} out of ${dto.records.length} attendance entries`,
      processedCount: results.length,
      records: results,
    };
  }

  /**
   * Update existing attendance record
   */
  async update(id: string, dto: UpdateAttendanceDto, userId?: string) {
    const existing = await prisma.attendanceLog.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!existing) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    const dataToUpdate: any = {};
    if (dto.status) dataToUpdate.status = dto.status;
    if (dto.checkIn !== undefined) dataToUpdate.checkIn = dto.checkIn ? new Date(dto.checkIn) : null;
    if (dto.checkOut !== undefined) dataToUpdate.checkOut = dto.checkOut ? new Date(dto.checkOut) : null;
    if (dto.lunchStart !== undefined) dataToUpdate.lunchStart = dto.lunchStart ? new Date(dto.lunchStart) : null;
    if (dto.lunchEnd !== undefined) dataToUpdate.lunchEnd = dto.lunchEnd ? new Date(dto.lunchEnd) : null;
    
    const empOtRate = Number(existing.employee?.otRatePerHour || 0);
    const computed = this.calculateHours(
      dto.checkIn !== undefined ? dto.checkIn : (existing.checkIn?.toISOString() || null),
      dto.checkOut !== undefined ? dto.checkOut : (existing.checkOut?.toISOString() || null),
      dto.lunchStart !== undefined ? dto.lunchStart : (existing.lunchStart?.toISOString() || null),
      dto.lunchEnd !== undefined ? dto.lunchEnd : (existing.lunchEnd?.toISOString() || null),
      dto.status || existing.status,
      empOtRate
    );

    dataToUpdate.workingHours = dto.workingHours !== undefined ? dto.workingHours : computed.workingHours;
    dataToUpdate.overtimeHours = dto.overtimeHours !== undefined ? dto.overtimeHours : computed.overtimeHours;
    dataToUpdate.shortageHours = dto.shortageHours !== undefined ? dto.shortageHours : computed.shortageHours;
    dataToUpdate.otAmount = dto.otAmount !== undefined ? dto.otAmount : computed.otAmount;
    if (dto.remarks !== undefined) dataToUpdate.remarks = dto.remarks;

    const updated = await prisma.attendanceLog.update({
      where: { id },
      data: dataToUpdate,
      include: { employee: true },
    });

    // Write Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_ATTENDANCE',
          entityName: 'AttendanceLog',
          entityId: id,
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
   * Delete attendance record
   */
  async delete(id: string, userId?: string) {
    const existing = await prisma.attendanceLog.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    await prisma.attendanceLog.delete({ where: { id } });

    // Write Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'DELETE_ATTENDANCE',
          entityName: 'AttendanceLog',
          entityId: id,
          oldValues: existing as any,
          userId: userId || null,
        },
      });
    } catch {
      // Audit log non-blocking
    }

    return { message: 'Attendance record deleted successfully', id };
  }
}
