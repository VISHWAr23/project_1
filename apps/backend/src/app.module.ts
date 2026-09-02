import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { JobWorkModule } from './modules/job-work/job-work.module';
import { RawMaterialsModule } from './modules/raw-materials/raw-materials.module';
import { RollTrackingModule } from './modules/roll-tracking/roll-tracking.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { SalaryModule } from './modules/salary/salary.module';
import { GauzeProductionModule } from './modules/gauze-production/gauze-production.module';
import { GamjeeProductionModule } from './modules/gamjee-production/gamjee-production.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CustomerOrdersModule } from './modules/customer-orders/customer-orders.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/backend/.env'],
    }),
    HealthModule,
    AuthModule,
    DashboardModule,
    NotificationsModule,
    JobWorkModule,
    RawMaterialsModule,
    RollTrackingModule,
    EmployeeModule,
    AttendanceModule,
    SalaryModule,
    GauzeProductionModule,
    GamjeeProductionModule,
    CustomersModule,
    CustomerOrdersModule,
  ],
})
export class AppModule {}
