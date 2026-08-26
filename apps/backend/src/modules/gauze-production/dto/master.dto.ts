import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsBoolean, IsInt } from 'class-validator';

export class CreateGauzeTypeDto {
  @ApiProperty({ description: 'Name of gauze type (e.g. BP17)' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Unique code' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ description: 'Detailed specification / description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class CreateGauzeSizeDto {
  @ApiProperty({ description: 'Size display name (e.g. 120 cm x 20 m)' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Width dimension', example: 120 })
  @IsNumber()
  @Min(0.01)
  width!: number;

  @ApiPropertyOptional({ description: 'Width UOM', default: 'cm' })
  @IsString()
  @IsOptional()
  widthUom?: string;

  @ApiProperty({ description: 'Length dimension', example: 20 })
  @IsNumber()
  @Min(0.01)
  length!: number;

  @ApiPropertyOptional({ description: 'Length UOM', default: 'm' })
  @IsString()
  @IsOptional()
  lengthUom?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class CreateBleachingTypeDto {
  @ApiProperty({ description: 'Bleaching process name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Unique process code' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ description: 'Description / chemicals used' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class CreateGauzeOperationTypeDto {
  @ApiProperty({ description: 'Operation name (e.g. Cutting, Folding)' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Operation code' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ description: 'Default sequence order', default: 1 })
  @IsInt()
  @IsOptional()
  sequence?: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
