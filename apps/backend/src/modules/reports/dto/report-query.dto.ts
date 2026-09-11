import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class DateRangeQueryDto {
  @ApiPropertyOptional({ description: 'Filter start date (YYYY-MM-DD or ISO string)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter end date (YYYY-MM-DD or ISO string)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Specific Job Working Company UUID' })
  @IsOptional()
  @IsUUID()
  jobWorkCompanyId?: string;

  @ApiPropertyOptional({ description: 'Department UUID filter' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Status filter' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Page limit' })
  @IsOptional()
  limit?: number;
}
