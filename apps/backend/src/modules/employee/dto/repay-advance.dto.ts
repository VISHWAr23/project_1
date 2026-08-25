import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { PaymentMethod } from '@ims/database';

export class RepayAdvanceDto {
  @ApiProperty({ description: 'Advance Record UUID' })
  @IsUUID()
  @IsNotEmpty()
  advanceId!: string;

  @ApiPropertyOptional({ description: 'Employee UUID' })
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @ApiProperty({ description: 'Repayment Amount in INR' })
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Notes / Remarks' })
  @IsString()
  @IsOptional()
  notes?: string;
}
