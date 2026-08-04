import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get executive dashboard KPI summary cards metrics' })
  async getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('charts')
  @ApiOperation({ summary: 'Get analytical chart datasets (Production, Material Usage, Salary, Trends)' })
  async getChartsData() {
    return this.dashboardService.getChartsData();
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get raw materials below minimum safety levels' })
  async getLowStockItems() {
    return this.dashboardService.getLowStockItems();
  }

  @Get('pending-jobs')
  @ApiOperation({ summary: 'Get active work orders in pending/approval status' })
  async getPendingJobs() {
    return this.dashboardService.getPendingJobs();
  }

  @Get('recent-work-orders')
  @ApiOperation({ summary: 'Get recent work orders' })
  async getRecentWorkOrders() {
    return this.dashboardService.getRecentWorkOrders();
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get real-time audit activities log feed' })
  async getActivities() {
    return this.dashboardService.getActivities();
  }

  @Get('latest-employees')
  @ApiOperation({ summary: 'Get newly onboarded employee staff' })
  async getLatestEmployees() {
    return this.dashboardService.getLatestEmployees();
  }
}
