import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceStatus } from '@ims/database';

@ApiTags('Attendance Management')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @ApiOperation({ summary: 'List daily punch logs with search, status, and department filters' })
  @ApiQuery({ name: 'date', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('date') date?: string,
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: AttendanceStatus | string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.attendanceService.findAll({ date, search, departmentId, status, page, limit });
  }

  @Get('today')
  @ApiOperation({ summary: 'Get Today’s Attendance KPI Stats Summary' })
  @ApiQuery({ name: 'date', required: false })
  async getTodaySummary(@Query('date') date?: string) {
    return this.attendanceService.getTodaySummary(date);
  }

  @Get('month')
  @ApiOperation({ summary: 'Get Monthly Attendance Grid Summary for Calendar View' })
  @ApiQuery({ name: 'month', required: true, description: '1-12' })
  @ApiQuery({ name: 'year', required: true, description: 'YYYY' })
  @ApiQuery({ name: 'departmentId', required: false })
  async getMonthSummary(
    @Query('month') month: number,
    @Query('year') year: number,
    @Query('departmentId') departmentId?: string,
  ) {
    const m = Number(month) || new Date().getMonth() + 1;
    const y = Number(year) || new Date().getFullYear();
    return this.attendanceService.getMonthSummary(m, y, departmentId);
  }

  @Get('employee/:id')
  @ApiOperation({ summary: 'Get attendance history for specific employee' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getEmployeeAttendance(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getEmployeeAttendance(id, startDate, endDate);
  }

  @Post()
  @ApiOperation({ summary: 'Mark single employee attendance' })
  async create(@Body() createDto: CreateAttendanceDto, @Req() req: any) {
    const userId = req?.user?.id;
    return this.attendanceService.create(createDto, userId);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk mark attendance for active employees' })
  async bulkCreate(@Body() bulkDto: BulkAttendanceDto, @Req() req: any) {
    const userId = req?.user?.id;
    return this.attendanceService.bulkCreate(bulkDto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an attendance log entry' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateAttendanceDto, @Req() req: any) {
    const userId = req?.user?.id;
    return this.attendanceService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attendance log entry' })
  async delete(@Param('id') id: string, @Req() req: any) {
    const userId = req?.user?.id;
    return this.attendanceService.delete(id, userId);
  }
}
