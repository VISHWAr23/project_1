import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GamjeeBatchQueryDto {
  @ApiPropertyOptional({ description: 'Search term for batch number, product name, SKU, or notes' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by batch status' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by Gamjee Size UUID' })
  @IsUUID()
  @IsOptional()
  gamjeeSizeId?: string;

  @ApiPropertyOptional({ description: 'Filter by finished product UUID' })
  @IsUUID()
  @IsOptional()
  finishedProductId?: string;

  @ApiPropertyOptional({ description: 'Start date filter' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date filter' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size limit', default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}
