import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WeavingReceivedItemDto {
  @ApiProperty({ description: 'Receipt date (YYYY-MM-DD)' })
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ description: 'In-Pass number / Gate pass number' })
  @IsNotEmpty()
  @IsString()
  inPassNumber!: string;

  @ApiProperty({ description: 'Description of woven fabric goods received' })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Received net weight in KG' })
  @IsNumber()
  @Min(0.001)
  weightKg!: number;

  @ApiPropertyOptional({ description: 'Description of wastage if any' })
  @IsString()
  @IsOptional()
  wastageDescription?: string;

  @ApiPropertyOptional({ description: 'Weight of wastage in KG' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  wastageWeightKg?: number;
}

export class ReceiveWeavingReturnDto {
  @ApiProperty({ description: 'Return receipt date (YYYY-MM-DD)' })
  @IsNotEmpty()
  returnedDate!: string;

  @ApiProperty({ description: 'List of received in-pass items', type: [WeavingReceivedItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeavingReceivedItemDto)
  items!: WeavingReceivedItemDto[];

  @ApiPropertyOptional({ description: 'General remarks for this return consignment' })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiPropertyOptional({ description: 'Mark entire order as completed / final return' })
  @IsBoolean()
  @IsOptional()
  isFinal?: boolean;
}
