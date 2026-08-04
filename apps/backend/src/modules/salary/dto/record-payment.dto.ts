import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@ims/database';

export class RecordSalaryPaymentDto {
  @IsUUID()
  payrollItemId!: string;

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
