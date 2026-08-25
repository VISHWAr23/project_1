import { IsNumber, IsOptional, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePayrollItemAdjustmentDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bonusAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  incentiveAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  overtimeHours?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  overtimeRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lateDeduction?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  advanceDeduction?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  loanDeduction?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pfDeduction?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  esiDeduction?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  professionalTax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  otherDeductions?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
