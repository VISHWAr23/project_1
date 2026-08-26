import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID, IsDateString, IsInt, IsBoolean } from 'class-validator';

export class CreatePackingEntryDto {
  @ApiProperty({ description: 'Finished Product UUID from Master Inventory' })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({ description: 'Size description (e.g. 10cm x 10cm or 10cm x 4m)' })
  @IsString()
  @IsOptional()
  sizeDescription?: string;

  @ApiPropertyOptional({ description: 'Ply count (e.g. 4, 8, 12, 16)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  ply?: number;

  @ApiProperty({ description: 'Pieces per pack', example: 100 })
  @IsInt()
  @Min(1)
  piecesPerPack!: number;

  @ApiProperty({ description: 'Total number of packs produced', example: 50 })
  @IsInt()
  @Min(1)
  numberOfPacks!: number;

  @ApiProperty({ description: 'Packing date', example: '2026-08-28' })
  @IsDateString()
  @IsNotEmpty()
  packingDate!: string;

  @ApiPropertyOptional({ description: 'Destination Finished Goods Warehouse / Storage Location UUID' })
  @IsUUID()
  @IsOptional()
  finishedGoodsWarehouseId?: string;

  @ApiPropertyOptional({ description: 'Packing notes or lot marks' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether to transition the batch to COMPLETED status', default: true })
  @IsBoolean()
  @IsOptional()
  markBatchCompleted?: boolean;
}
