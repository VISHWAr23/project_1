import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID, IsDateString } from 'class-validator';

export class CreateGauzeProductionBatchDto {
  @ApiProperty({ description: 'Raw Material / Product UUID' })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({ description: 'Gauze Type UUID' })
  @IsUUID()
  @IsOptional()
  gauzeTypeId?: string;

  @ApiPropertyOptional({ description: 'Gauze Size UUID' })
  @IsUUID()
  @IsOptional()
  gauzeSizeId?: string;

  @ApiPropertyOptional({ description: 'Raw Material Batch UUID' })
  @IsUUID()
  @IsOptional()
  rawMaterialBatchId?: string;

  @ApiPropertyOptional({ description: 'Supplier UUID' })
  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Supplier reference/invoice' })
  @IsString()
  @IsOptional()
  supplierReference?: string;

  @ApiPropertyOptional({ description: 'Roll or thans number/lot' })
  @IsString()
  @IsOptional()
  rollOrThansNumber?: string;

  @ApiProperty({ description: 'Input material quantity', example: 1000 })
  @IsNumber()
  @Min(0.001)
  inputQuantity!: number;

  @ApiProperty({ description: 'Unit of measure', example: 'meter' })
  @IsString()
  @IsNotEmpty()
  inputUom!: string;

  @ApiPropertyOptional({ description: 'Production start date', example: '2026-08-26' })
  @IsDateString()
  @IsOptional()
  productionStartDate?: string;

  @ApiPropertyOptional({ description: 'Expected completion date', example: '2026-08-30' })
  @IsDateString()
  @IsOptional()
  expectedCompletionDate?: string;

  @ApiPropertyOptional({ description: 'Storage location / warehouse UUID' })
  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @ApiPropertyOptional({ description: 'Notes or remarks' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateGauzeProductionBatchDto {
  @ApiPropertyOptional({ description: 'Gauze Type UUID' })
  @IsUUID()
  @IsOptional()
  gauzeTypeId?: string;

  @ApiPropertyOptional({ description: 'Gauze Size UUID' })
  @IsUUID()
  @IsOptional()
  gauzeSizeId?: string;

  @ApiPropertyOptional({ description: 'Supplier UUID' })
  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Expected completion date' })
  @IsDateString()
  @IsOptional()
  expectedCompletionDate?: string;

  @ApiPropertyOptional({ description: 'Notes or remarks' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Production status' })
  @IsString()
  @IsOptional()
  status?: any;
}
