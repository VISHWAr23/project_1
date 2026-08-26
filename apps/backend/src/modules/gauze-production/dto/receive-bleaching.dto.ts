import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID, IsDateString } from 'class-validator';

export class ReceiveBleachingDto {
  @ApiProperty({ description: 'Bleaching Job Order UUID' })
  @IsUUID()
  @IsNotEmpty()
  bleachingJobId!: string;

  @ApiProperty({ description: 'Actual quantity received back', example: 950 })
  @IsNumber()
  @Min(0)
  quantityReceived!: number;

  @ApiPropertyOptional({ description: 'Wastage / loss quantity', example: 30, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  wastageQuantity?: number;

  @ApiPropertyOptional({ description: 'Rejected defective quantity', example: 20, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  rejectedQuantity?: number;

  @ApiProperty({ description: 'Received date', example: '2026-08-27' })
  @IsDateString()
  @IsNotEmpty()
  receivedDate!: string;

  @ApiPropertyOptional({ description: 'Quality inspection status', example: 'PASSED', default: 'PASSED' })
  @IsString()
  @IsOptional()
  qualityStatus?: string;

  @ApiPropertyOptional({ description: 'Notes or delivery remarks' })
  @IsString()
  @IsOptional()
  notes?: string;
}
