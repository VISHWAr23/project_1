import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordOrderPaymentDto {
  @ApiProperty({ example: 25000.0 })
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @ApiPropertyOptional({ example: 'BANK_TRANSFER' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'PAID' })
  @IsString()
  @IsOptional()
  paymentStatus?: string;

  @ApiPropertyOptional({ example: 'NEFT UTR: SBIN2026082700481' })
  @IsString()
  @IsOptional()
  notes?: string;
}
