import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAdvanceDto {
  @ApiProperty({ description: 'Employee UUID' })
  @IsUUID()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({ description: 'Advance Loan Amount in INR' })
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @ApiPropertyOptional({ description: 'Weekly deduction installment (e.g. 500)' })
  @IsNumber()
  @IsOptional()
  weeklyDeduction?: number;

  @ApiPropertyOptional({ description: 'Reason / Purpose for advance' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'Issue Date (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  issueDate?: string;
}
