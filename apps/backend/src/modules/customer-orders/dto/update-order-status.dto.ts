import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'IN_PRODUCTION' })
  @IsString()
  @IsNotEmpty()
  status!: string;

  @ApiPropertyOptional({ example: 'Dispatched via Express Logistics vehicle TN-38-BZ-4589' })
  @IsString()
  @IsOptional()
  notes?: string;
}
