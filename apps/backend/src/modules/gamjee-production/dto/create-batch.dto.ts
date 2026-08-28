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
