import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID, IsBoolean } from 'class-validator';

export class CreateRawMaterialDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  unitId?: string;

  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @IsUUID()
  @IsOptional()
  storageLocationId?: string;

  @IsString()
  @IsOptional()
  hsnCode?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  gstRate?: number;

  @IsNumber()
  @Min(0)
  minimumStockLevel!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maximumStockLevel?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  reorderQuantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  initialStock?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitCost?: number;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsString()
  @IsOptional()
  dimensionInches?: string;

  @IsString()
  @IsOptional()
  dimensionCm?: string;

  @IsString()
  @IsOptional()
  packSize?: string;

  @IsNumber()
  @IsOptional()
  innerPackQty?: number;

  @IsString()
  @IsOptional()
  packUnit?: string;

  @IsString()
  @IsOptional()
  boxSize?: string;

  @IsNumber()
  @IsOptional()
  masterCartonQty?: number;

  @IsString()
  @IsOptional()
  features?: string;

  @IsString()
  @IsOptional()
  variantType?: string;

  @IsUUID()
  @IsOptional()
  secondaryUnitId?: string;

  @IsNumber()
  @IsOptional()
  conversionFactor?: number;

  @IsString()
  @IsOptional()
  secondaryUnitName?: string;
}
