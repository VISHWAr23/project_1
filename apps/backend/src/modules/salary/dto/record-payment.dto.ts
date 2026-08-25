import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@ims/database';

export class RecordSalaryPaymentDto {
  @IsOptional()
  @IsUUID()
  payrollItemId?: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsString()
  paymentType?: 'NORMAL_SALARY' | 'OVERTIME_SALARY' | 'ADVANCE_DISBURSEMENT' | 'ADVANCE_REPAYMENT' | 'FULL_SETTLEMENT';

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  transactionRef?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
