import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsBoolean, IsInt, IsUUID } from 'class-validator';

export class CreateGamjeeSizeDto {
  @ApiProperty({ description: 'Size name', example: '15 cm x 8 m' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Width value', example: 15 })
  @IsNumber()
  @Min(0.1)
  width!: number;

  @ApiPropertyOptional({ description: 'Width UOM', example: 'cm', default: 'cm' })
  @IsString()
  @IsOptional()
  widthUom?: string;

  @ApiProperty({ description: 'Length value', example: 8 })
  @IsNumber()
  @Min(0.1)
  length!: number;

  @ApiPropertyOptional({ description: 'Length UOM', example: 'm', default: 'm' })
  @IsString()
  @IsOptional()
  lengthUom?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class CreateGamjeeOperationTypeDto {
  @ApiProperty({ description: 'Operation name', example: 'Pinning' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Operation code', example: 'OP-PIN' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ description: 'Sequence number', example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  sequence?: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class CreateGamjeeProductMasterDto {
  @ApiPropertyOptional({ description: 'Linked RawMaterial / Product ID' })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiProperty({ description: 'Product Name', example: 'Cotton Gamjee Roll (15cm x 8m)' })
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @ApiPropertyOptional({ description: 'Gamjee Type category' })
  @IsString()
  @IsOptional()
  gamjeeType?: string;

  @ApiPropertyOptional({ description: 'Width' })
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({ description: 'Width UOM' })
  @IsString()
  @IsOptional()
  widthUom?: string;

  @ApiPropertyOptional({ description: 'Roll Length' })
  @IsNumber()
  @IsOptional()
  rollLength?: number;

  @ApiPropertyOptional({ description: 'Length UOM' })
  @IsString()
  @IsOptional()
  lengthUom?: string;

  @ApiPropertyOptional({ description: 'Standard Cotton requirement in kg' })
  @IsNumber()
  @IsOptional()
  cottonRequirement?: number;

  @ApiPropertyOptional({ description: 'Cotton UOM' })
  @IsString()
  @IsOptional()
  cottonUom?: string;

  @ApiPropertyOptional({ description: 'Standard Fabric requirement in meters' })
  @IsNumber()
  @IsOptional()
  fabricRequirement?: number;

  @ApiPropertyOptional({ description: 'Fabric UOM' })
  @IsString()
  @IsOptional()
  fabricUom?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
