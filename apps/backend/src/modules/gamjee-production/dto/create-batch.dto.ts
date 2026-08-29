import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID, IsDateString } from 'class-validator';

export class CreateGamjeeProductionBatchDto {
  @ApiProperty({ description: 'Finished Gamjee Product UUID' })
  @IsUUID()
  @IsNotEmpty()
  finishedProductId!: string;

  @ApiPropertyOptional({ description: 'Gamjee Size UUID' })
  @IsUUID()
  @IsOptional()
  gamjeeSizeId?: string;

  @ApiPropertyOptional({ description: 'Planned production quantity in rolls', example: 100 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  productionQuantity?: number;

  @ApiPropertyOptional({ description: 'Unit of measure', example: 'Rolls' })
  @IsString()
  @IsOptional()
  productionUom?: string;

  @ApiProperty({ description: 'Production date', example: '2026-08-28' })
  @IsDateString()
  @IsNotEmpty()
  productionDate!: string;

  @ApiPropertyOptional({ description: 'Expected completion date', example: '2026-08-30' })
  @IsDateString()
  @IsOptional()
  expectedCompletionDate?: string;

  @ApiPropertyOptional({ description: 'Planning calculation mode', example: 'FROM_FABRIC' })
  @IsString()
  @IsOptional()
  calculationMode?: 'FROM_FABRIC' | 'FROM_PIECES';

  @ApiPropertyOptional({ description: 'Pinning size in meters', example: 3 })
  @IsNumber()
  @Min(0.1)
  @IsOptional()
  pinningSizeMeters?: number;

  @ApiPropertyOptional({ description: 'Folding & cutting cuts per fold multiplier', example: 3 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  foldingCutsCount?: number;

  @ApiPropertyOptional({ description: 'Cotton Specification UUID' })
  @IsUUID()
  @IsOptional()
  cottonSpecId?: string;

  @ApiPropertyOptional({ description: 'Cotton Type Name', example: '1 KG 900 Web' })
  @IsString()
  @IsOptional()
  cottonTypeName?: string;

  @ApiPropertyOptional({ description: 'Planned total fabric in meters', example: 100 })
  @IsNumber()
  @IsOptional()
  plannedFabricMeters?: number;

  @ApiPropertyOptional({ description: 'Planned total cotton in KG', example: 8.25 })
  @IsNumber()
  @IsOptional()
  plannedCottonKg?: number;

  @ApiPropertyOptional({ description: 'Notes or remarks' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateGamjeeProductionBatchDto {
  @ApiPropertyOptional({ description: 'Gamjee Size UUID' })
  @IsUUID()
  @IsOptional()
  gamjeeSizeId?: string;

  @ApiPropertyOptional({ description: 'Planned production quantity' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  productionQuantity?: number;

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
