import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID, IsDateString, IsInt } from 'class-validator';

export class AddGamjeeOperationDto {
  @ApiProperty({ description: 'Operation Type UUID (Pinning, Folding, Cutting, etc.)' })
  @IsUUID()
  @IsNotEmpty()
  operationTypeId!: string;

  @ApiPropertyOptional({ description: 'Sequence number', example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  sequenceNumber?: number;

  @ApiProperty({ description: 'Input material quantity', example: 1000 })
  @IsNumber()
  @Min(0)
  inputQuantity!: number;

  @ApiPropertyOptional({ description: 'Input UOM', example: 'meter' })
  @IsString()
  @IsOptional()
  inputUom?: string;

  @ApiProperty({ description: 'Output material quantity', example: 990 })
  @IsNumber()
  @Min(0)
  outputQuantity!: number;

  @ApiPropertyOptional({ description: 'Output UOM', example: 'meter' })
  @IsString()
  @IsOptional()
  outputUom?: string;

  @ApiPropertyOptional({ description: 'Wastage quantity', example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  wastageQuantity?: number;

  @ApiPropertyOptional({ description: 'Rejected quantity', example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  rejectedQuantity?: number;

  @ApiPropertyOptional({ description: 'Assigned operator / Employee UUID' })
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Machine ID / Line' })
  @IsString()
  @IsOptional()
  machineId?: string;

  @ApiProperty({ description: 'Operation completion date', example: '2026-08-28' })
  @IsDateString()
  @IsNotEmpty()
  operationDate!: string;

  @ApiPropertyOptional({ description: 'Notes or remarks' })
  @IsString()
  @IsOptional()
  notes?: string;
}
