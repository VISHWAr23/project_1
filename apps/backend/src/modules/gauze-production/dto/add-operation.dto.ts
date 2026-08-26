import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID, IsDateString, IsInt } from 'class-validator';

export class AddProcessingOperationDto {
  @ApiProperty({ description: 'Operation Type UUID (e.g. Cutting, Folding, etc.)' })
  @IsUUID()
  @IsNotEmpty()
  operationTypeId!: string;

  @ApiPropertyOptional({ description: 'Operation sequence order', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  sequenceNumber?: number;

  @ApiProperty({ description: 'Input material quantity for this operation', example: 950 })
  @IsNumber()
  @Min(0.001)
  inputQuantity!: number;

  @ApiProperty({ description: 'Output good processed quantity', example: 900 })
  @IsNumber()
  @Min(0)
  outputQuantity!: number;

  @ApiPropertyOptional({ description: 'Wastage during processing', example: 50, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  wastageQuantity?: number;

  @ApiPropertyOptional({ description: 'Rejected / damaged quantity', example: 0, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  rejectedQuantity?: number;

  @ApiProperty({ description: 'Unit of measure', example: 'meter' })
  @IsString()
  @IsNotEmpty()
  uom!: string;

  @ApiPropertyOptional({ description: 'Operating employee UUID' })
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Machine / Station identifier' })
  @IsString()
  @IsOptional()
  machineId?: string;

  @ApiProperty({ description: 'Operation date', example: '2026-08-27' })
  @IsDateString()
  @IsNotEmpty()
  operationDate!: string;

  @ApiPropertyOptional({ description: 'Notes or operation comments' })
  @IsString()
  @IsOptional()
  notes?: string;
}
