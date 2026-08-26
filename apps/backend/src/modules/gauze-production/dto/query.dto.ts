import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { GauzeProductionStatus } from '@ims/database';

export class GauzeBatchQueryDto {
  @ApiPropertyOptional({ description: 'Search across batch number, product name, or notes' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by production status', enum: GauzeProductionStatus })
  @IsOptional()
  @IsEnum(GauzeProductionStatus)
  status?: GauzeProductionStatus;

  @ApiPropertyOptional({ description: 'Filter by Gauze Type UUID' })
  @IsOptional()
  @IsString()
  gauzeTypeId?: string;

  @ApiPropertyOptional({ description: 'Filter by Gauze Size UUID' })
  @IsOptional()
  @IsString()
  gauzeSizeId?: string;

  @ApiPropertyOptional({ description: 'Filter by Supplier UUID' })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Filter by Product UUID' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort field', default: 'createdAt' })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort direction', default: 'desc' })
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
