import { Module } from '@nestjs/common';
import { SalaryController } from './salary.controller';
import { SalaryService } from './salary.service';
import { PayrollEngineService } from './payroll-engine.service';

@Module({
  controllers: [SalaryController],
  providers: [SalaryService, PayrollEngineService],
  exports: [SalaryService, PayrollEngineService],
})
export class SalaryModule {}
