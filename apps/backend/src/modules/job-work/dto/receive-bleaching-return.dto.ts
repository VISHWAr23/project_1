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
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BleachingReceivedItemDto {
  @ApiProperty({ description: 'Receipt date (YYYY-MM-DD)' })
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ description: 'In-Pass number / DC number' })
  @IsNotEmpty()
  @IsString()
  inPassNumber!: string;

  @ApiProperty({ description: 'Description of bleached fabric goods received' })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Received net weight in KG' })
  @IsNumber()
  @Min(0.001)
  weightKg!: number;

  @ApiPropertyOptional({
    description: 'Form of fabric received: Roll or Than',
    enum: ['Roll', 'Than'],
    default: 'Roll',
  })
  @IsIn(['Roll', 'Than'])
  @IsOptional()
  rollOrThan?: string;

  @ApiPropertyOptional({ description: 'Optional length in meters' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  lengthMeters?: number;

  @ApiPropertyOptional({ description: 'Whiteness index or QC grade (e.g. 92% CIE / Medical Grade)' })
  @IsString()
  @IsOptional()
  whitenessIndex?: string;

  @ApiPropertyOptional({ description: 'Description of wastage or edge cut pieces if any' })
  @IsString()
  @IsOptional()
  wastageDescription?: string;

  @ApiPropertyOptional({ description: 'Weight of wastage in KG' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  wastageWeightKg?: number;
}

export class ReceiveBleachingReturnDto {
  @ApiProperty({ description: 'Return receipt date (YYYY-MM-DD)' })
  @IsNotEmpty()
  returnedDate!: string;

  @ApiProperty({ description: 'List of received bleached items', type: [BleachingReceivedItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BleachingReceivedItemDto)
  items!: BleachingReceivedItemDto[];

  @ApiPropertyOptional({ description: 'General remarks for this bleaching return' })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiPropertyOptional({ description: 'Mark entire bleaching order as completed / final return' })
  @IsBoolean()
  @IsOptional()
  isFinal?: boolean;
}
