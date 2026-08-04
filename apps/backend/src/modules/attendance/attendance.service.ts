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
   * Helper: Auto-calculate working hours & overtime from checkIn/checkOut
   */
  private calculateHours(checkInStr?: string, checkOutStr?: string, status?: AttendanceStatus) {
    if (status === AttendanceStatus.ABSENT || status === AttendanceStatus.LEAVE || status === AttendanceStatus.HOLIDAY || status === AttendanceStatus.WEEKLY_OFF) {
      return { workingHours: 0, overtimeHours: 0 };
    }

    if (status === AttendanceStatus.HALF_DAY) {
      return { workingHours: 4 };
    }

    if (!checkInStr || !checkOutStr) {
      return { workingHours: 8 };
    }

    try {
      const inTime = new Date(checkInStr).getTime();
      const outTime = new Date(checkOutStr).getTime();
      if (outTime > inTime) {
        const totalMinutes = (outTime - inTime) / (1000 * 60);
        const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
        const workingHours = Math.min(totalHours, 8);
        return { workingHours };
      }
    } catch {
      // Fallback
    }

    return { workingHours: 8 };
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
      select: { status: true },
    });

    const presentCount = logs.filter((l) => l.status === AttendanceStatus.PRESENT).length;
    const absentCount = logs.filter((l) => l.status === AttendanceStatus.ABSENT).length;
    const halfDayCount = logs.filter((l) => l.status === AttendanceStatus.HALF_DAY).length;
    const leaveCount = logs.filter((l) => l.status === AttendanceStatus.LEAVE).length;
    const unmarkedCount = Math.max(0, activeEmployeesCount - logs.length);

    return {
      date: dateUtc.toISOString().split('T')[0],
      totalActiveEmployees: activeEmployeesCount,
      presentToday: presentCount,
      absentToday: absentCount,
      halfDayToday: halfDayCount,
      leaveToday: leaveCount,
      unmarkedToday: unmarkedCount,
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

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department?.name || 'Unassigned',
        designation: emp.designation?.name || 'Staff',
        totalPresent,
        totalAbsent,
        totalHalfDay,
        totalLeave,
        totalWorkingHours,
        logs: logs.map((l) => ({
          date: l.date.toISOString().split('T')[0],
          status: l.status,
          workingHours: l.workingHours,
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

    const computed = this.calculateHours(dto.checkIn, dto.checkOut, dto.status);
    const workingHours = dto.workingHours !== undefined ? dto.workingHours : computed.workingHours;

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
        workingHours,
        remarks: dto.remarks,
        createdByUserId: userId || null,
      },
      create: {
        employeeId: dto.employeeId,
        date,
        status: dto.status,
        checkIn,
        checkOut,
        workingHours,
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
            workingHours: item.workingHours,
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
    const existing = await prisma.attendanceLog.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    const dataToUpdate: any = {};
    if (dto.status) dataToUpdate.status = dto.status;
    if (dto.checkIn !== undefined) dataToUpdate.checkIn = dto.checkIn ? new Date(dto.checkIn) : null;
    if (dto.checkOut !== undefined) dataToUpdate.checkOut = dto.checkOut ? new Date(dto.checkOut) : null;
    if (dto.workingHours !== undefined) dataToUpdate.workingHours = dto.workingHours;
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
