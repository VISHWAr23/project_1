import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DispatchItemDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  itemId!: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  dispatchQuantity!: number;
}

export class RecordOrderDispatchDto {
  @ApiProperty({ type: [DispatchItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DispatchItemDto)
  items!: DispatchItemDto[];

  @ApiPropertyOptional({ example: '2026-08-29' })
  @IsString()
  @IsOptional()
  dispatchDate?: string;

  @ApiPropertyOptional({ example: 'VRL Logistics' })
  @IsString()
  @IsOptional()
  transportName?: string;

  @ApiPropertyOptional({ example: 'ROAD' })
  @IsString()
  @IsOptional()
  transportMode?: string;

  @ApiPropertyOptional({ example: 'TN-38-BZ-4589' })
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
