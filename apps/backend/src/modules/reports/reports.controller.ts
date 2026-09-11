import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { DateRangeQueryDto } from './dto/report-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Reports & Analytics')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('job-work-company')
  @ApiOperation({
    summary: 'Get Job Working Company report with custom date range (Work Volume, Scrap %, Wages Earned, Payouts, Ledger)',
  })
  async getJobWorkCompanyReport(@Query() query: DateRangeQueryDto) {
    return this.reportsService.getJobWorkCompanyReport(query);
  }

  @Get('stock-valuation')
  @ApiOperation({ summary: 'Get Inventory Stock Valuation by Category with Reorder Status' })
  async getStockValuationReport() {
    return this.reportsService.getStockValuationReport();
  }

  @Get('production-efficiency')
  @ApiOperation({ summary: 'Get Production Output, Yield Rate, and Scrap Analysis' })
  async getProductionEfficiencyReport(@Query() query: DateRangeQueryDto) {
    return this.reportsService.getProductionEfficiencyReport(query);
  }

  @Get('payroll-expenses')
  @ApiOperation({ summary: 'Get Attendance and Payroll Expense Analytics with Department Breakdown' })
  async getPayrollExpenseReport(@Query() query: DateRangeQueryDto) {
    return this.reportsService.getPayrollExpenseReport(query);
  }

  @Get('customer-orders')
  @ApiOperation({ summary: 'Get Customer Orders Fulfillment and Revenue Analytics' })
  async getCustomerOrdersReport(@Query() query: DateRangeQueryDto) {
    return this.reportsService.getCustomerOrdersReport(query);
  }

  @Get('executive-summary')
  @ApiOperation({ summary: 'Get High-Level Multi-Module Executive Overview KPIs' })
  async getExecutiveOverview(@Query() query: DateRangeQueryDto) {
    return this.reportsService.getExecutiveOverview(query);
  }
}
