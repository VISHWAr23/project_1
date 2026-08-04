import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryDto {
  @ApiProperty() totalEmployees!: number;
  @ApiProperty() totalEmployeesChange!: number;
  @ApiProperty() jobWorkCompanies!: number;
  @ApiProperty() activeJobChallans!: number;
  @ApiProperty() rawMaterialsCount!: number;
  @ApiProperty() totalStockValuation!: number;
  @ApiProperty() finishedProductsCount!: number;
  @ApiProperty() todayProduction!: number;
  @ApiProperty() todayProductionChange!: number;
  @ApiProperty() todayMaterialIssues!: number;
  @ApiProperty() todayMaterialIssuesCount!: number;
  @ApiProperty() productReturns!: number;
  @ApiProperty() rejectionRate!: number;
  @ApiProperty() pendingWorkOrders!: number;
  @ApiProperty() highPriorityPendingOrders!: number;
  @ApiProperty() completedWorkOrders!: number;
  @ApiProperty() completedThisMonth!: number;
  @ApiProperty() lowStockCount!: number;
}
