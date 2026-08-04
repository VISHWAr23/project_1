import { Controller, Get, Post, Patch, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SalaryService } from './salary.service';
import { PayrollStatus } from '@ims/database';
import { GeneratePayrollDto } from './dto/generate-payroll.dto';
import { UpdatePayrollItemAdjustmentDto } from './dto/update-payroll-item.dto';
import { RecordSalaryPaymentDto } from './dto/record-payment.dto';

@ApiTags('Salary & Payroll Management')
@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get Salary & Payroll Dashboard KPIs & Metrics' })
  getDashboardSummary() {
    return this.salaryService.getDashboardSummary();
  }

  @Get()
  @ApiOperation({ summary: 'List all monthly payroll runs' })
  findAll(
    @Query('month') month?: number,
    @Query('year') year?: number,
    @Query('status') status?: PayrollStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.salaryService.findAll({ month, year, status, page, limit });
  }

  @Get('history')
  @ApiOperation({ summary: 'Search historical salary payout records' })
  getSalaryHistory(@Query('employeeId') employeeId?: string, @Query('year') year?: number) {
    return this.salaryService.getSalaryHistory(employeeId, year);
  }

  @Get('items/:itemId/slip')
  @ApiOperation({ summary: 'Get salary slip details for an employee' })
  getSalarySlip(@Param('itemId') itemId: string) {
    return this.salaryService.getSalarySlip(itemId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single payroll run details with line items' })
  findOne(@Param('id') id: string) {
    return this.salaryService.findOne(id);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Run monthly payroll calculation engine' })
  generatePayroll(@Body() dto: GeneratePayrollDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.salaryService.generatePayroll(dto, userId);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update adjustments for a salary line item' })
  updatePayrollItemAdjustment(
    @Param('itemId') itemId: string,
    @Body() dto: UpdatePayrollItemAdjustmentDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.salaryService.updatePayrollItemAdjustment(itemId, dto, userId);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve payroll batch and generate pay slips' })
  approvePayroll(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.salaryService.approvePayroll(id, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a payroll batch' })
  cancelPayroll(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.salaryService.cancelPayroll(id, userId);
  }

  @Post('items/:itemId/payment')
  @ApiOperation({ summary: 'Record disbursement payment for employee salary' })
  recordPayment(@Body() dto: RecordSalaryPaymentDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.salaryService.recordPayment(dto, userId);
  }
}
