import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID, IsDateString } from 'class-validator';

export class SendToBleachingDto {
  @ApiProperty({ description: 'Bleaching Vendor / Job Work Company UUID' })
  @IsUUID()
  @IsNotEmpty()
  vendorId!: string;

  @ApiProperty({ description: 'Bleaching Process Type UUID' })
  @IsUUID()
  @IsNotEmpty()
  bleachingTypeId!: string;

  @ApiProperty({ description: 'Quantity to send to vendor', example: 1000 })
  @IsNumber()
  @Min(0.001)
  quantitySent!: number;

  @ApiProperty({ description: 'Unit of measure', example: 'meter' })
  @IsString()
  @IsNotEmpty()
  uom!: string;

  @ApiProperty({ description: 'Date sent to vendor', example: '2026-08-26' })
  @IsDateString()
  @IsNotEmpty()
  sentDate!: string;

  @ApiPropertyOptional({ description: 'Expected return date', example: '2026-08-28' })
  @IsDateString()
  @IsOptional()
  expectedReturnDate?: string;

  @ApiPropertyOptional({ description: 'Job work processing rate per unit', example: 4.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  rate?: number;

  @ApiPropertyOptional({ description: 'Notes or instructions' })
  @IsString()
  @IsOptional()
  notes?: string;
}
