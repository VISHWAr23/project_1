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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/backend/.env'],
    }),
    HealthModule,
    AuthModule,
    DashboardModule,
    JobWorkModule,
    RawMaterialsModule,
    RollTrackingModule,
    EmployeeModule,
    AttendanceModule,
    SalaryModule,
  ],
})
export class AppModule {}
