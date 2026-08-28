import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID, IsDateString } from 'class-validator';

export class IssueGamjeeMaterialsDto {
  // Bleached Fabric Inputs
  @ApiProperty({ description: 'Bleached Fabric Product UUID' })
  @IsUUID()
  @IsNotEmpty()
  fabricProductId!: string;

  @ApiPropertyOptional({ description: 'Inventory Batch UUID for fabric' })
  @IsUUID()
  @IsOptional()
  fabricInventoryBatchId?: string;

  @ApiPropertyOptional({ description: 'Roll or lot number for fabric' })
  @IsString()
  @IsOptional()
  fabricRollOrBatchNumber?: string;

  @ApiProperty({ description: 'Fabric quantity to issue', example: 1000 })
  @IsNumber()
  @Min(0.001)
  fabricQuantityIssued!: number;

  @ApiPropertyOptional({ description: 'Fabric UOM', example: 'meter' })
  @IsString()
  @IsOptional()
  fabricUom?: string;

  @ApiPropertyOptional({ description: 'Source warehouse UUID for fabric' })
  @IsUUID()
  @IsOptional()
  fabricWarehouseId?: string;

  // Cotton Roll Inputs
  @ApiProperty({ description: 'Cotton Roll Product UUID' })
  @IsUUID()
  @IsNotEmpty()
  cottonProductId!: string;

  @ApiPropertyOptional({ description: 'Inventory Batch UUID for cotton' })
  @IsUUID()
  @IsOptional()
  cottonInventoryBatchId?: string;

  @ApiPropertyOptional({ description: 'Roll or lot number for cotton' })
  @IsString()
  @IsOptional()
  cottonRollOrBatchNumber?: string;

  @ApiProperty({ description: 'Cotton quantity to issue', example: 12 })
  @IsNumber()
  @Min(0.001)
  cottonQuantityIssued!: number;

  @ApiPropertyOptional({ description: 'Cotton UOM', example: 'kg' })
  @IsString()
  @IsOptional()
  cottonUom?: string;

  @ApiPropertyOptional({ description: 'Source warehouse UUID for cotton' })
  @IsUUID()
  @IsOptional()
  cottonWarehouseId?: string;

  @ApiProperty({ description: 'Issue date', example: '2026-08-28' })
  @IsDateString()
  @IsNotEmpty()
  issuedDate!: string;

  @ApiPropertyOptional({ description: 'Notes or remarks' })
  @IsString()
  @IsOptional()
  notes?: string;
}
