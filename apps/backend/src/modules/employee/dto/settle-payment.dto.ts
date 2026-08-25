import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { PaymentMethod } from '@ims/database';

export class SettlePaymentDto {
  @ApiProperty({ description: 'Employee UUID' })
  @IsUUID()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({
    description: 'Payment settlement category',
    enum: ['NORMAL_SALARY', 'OVERTIME_SALARY', 'ADVANCE_DISBURSEMENT', 'ADVANCE_REPAYMENT', 'FULL_SETTLEMENT'],
  })
  @IsString()
  @IsNotEmpty()
  paymentType!: 'NORMAL_SALARY' | 'OVERTIME_SALARY' | 'ADVANCE_DISBURSEMENT' | 'ADVANCE_REPAYMENT' | 'FULL_SETTLEMENT';

  @ApiProperty({ description: 'Payment Amount in INR' })
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @ApiPropertyOptional({ description: 'Weekly deduction installment if advance disbursement' })
  @IsNumber()
  @IsOptional()
  weeklyDeduction?: number;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Payment reference / transaction ID' })
  @IsString()
  @IsOptional()
  transactionRef?: string;

  @ApiPropertyOptional({ description: 'Remarks / Notes' })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiPropertyOptional({ description: 'Associated Advance UUID if repaying an advance' })
  @IsUUID()
  @IsOptional()
  advanceId?: string;
}
