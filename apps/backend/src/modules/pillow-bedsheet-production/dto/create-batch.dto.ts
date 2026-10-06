import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsArray,
  IsDateString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePillowBedsheetBatchDto {
  @ApiPropertyOptional({ description: 'Custom batch number (auto-generated if omitted)' })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({ description: 'Product title / name', example: 'Hospital Grade Cotton Bed Sheet' })
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @ApiProperty({ description: 'Product type', enum: ['BED_SHEET', 'PILLOW_COVER'] })
  @IsIn(['BED_SHEET', 'PILLOW_COVER'])
  productType!: 'BED_SHEET' | 'PILLOW_COVER';

  @ApiProperty({ description: 'Fabric weight in KG', example: 65 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  weightKg!: number;

  @ApiProperty({ description: 'Fabric GSM', example: 130 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  gsm!: number;

  @ApiProperty({ description: 'Roll width', example: 160 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  rollWidth!: number;

  @ApiPropertyOptional({ description: 'Roll width UOM', example: 'cm', default: 'cm' })
  @IsString()
  @IsOptional()
  rollWidthUom?: string;

  // Bed Sheet specific
  @ApiPropertyOptional({ description: 'Bed sheet piece length', example: 2.4 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  bedSheetLength?: number;

  @ApiPropertyOptional({ description: 'Bed sheet length UOM', example: 'm', default: 'm' })
  @IsString()
  @IsOptional()
  bedSheetLengthUom?: string;

  // Pillow cover specific
  @ApiPropertyOptional({ description: 'Pillow cover cutting length', example: 0.8 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pillowCoverCuttingLength?: number;

  @ApiPropertyOptional({ description: 'Pillow cover cutting length UOM', example: 'm', default: 'm' })
  @IsString()
  @IsOptional()
  pillowCoverCuttingLengthUom?: string;

  @ApiPropertyOptional({ description: 'Cutting count multiplier', example: 2, default: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  cuttingCount?: number;

  // Initial progress
  @ApiPropertyOptional({ description: 'Initially completed quantity', default: 0 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  completedQuantity?: number;

  // Salary Engine
  @ApiPropertyOptional({ description: 'Salary wage rate per finished unit (INR)', example: 4.5, default: 0 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  salaryRatePerUnit?: number;

  // Workforce & Assignment
  @ApiProperty({ description: 'Executor type', enum: ['WORKERS', 'COMPANY'], default: 'WORKERS' })
  @IsIn(['WORKERS', 'COMPANY'])
  executorType!: 'WORKERS' | 'COMPANY';

  @ApiPropertyOptional({ description: 'Assigned worker IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  workerIds?: string[];

  @ApiPropertyOptional({ description: 'Assigned worker names' })
  @IsString()
  @IsOptional()
  workerNames?: string;

  @ApiPropertyOptional({ description: 'Assigned company UUID' })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Assigned company name' })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ description: 'Delivery person' })
  @IsString()
  @IsOptional()
  deliveryPerson?: string;

  @ApiPropertyOptional({ description: 'Vehicle number' })
  @IsString()
  @IsOptional()
  vehicleNumber?: string;

  // Notebook / DC info
  @ApiPropertyOptional({ description: 'DC number' })
  @IsString()
  @IsOptional()
  dcNo?: string;

  @ApiPropertyOptional({ description: 'DC date' })
  @IsDateString()
  @IsOptional()
  dcDate?: string;

  @ApiPropertyOptional({ description: 'Ends count' })
  @IsString()
  @IsOptional()
  ends?: string;

  @ApiPropertyOptional({ description: 'Item type specification' })
  @IsString()
  @IsOptional()
  itemType?: string;

  // Lifecycle dates & notes
  @ApiPropertyOptional({ description: 'Production start date' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Target completion date' })
  @IsDateString()
  @IsOptional()
  targetDate?: string;

  @ApiPropertyOptional({ description: 'Production remarks / notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePillowBedsheetProgressDto {
  @ApiProperty({ description: 'Updated count of completed finished units', example: 50 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  completedQuantity!: number;

  @ApiPropertyOptional({ description: 'Optional status change', enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Production remarks / notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePillowBedsheetStatusDto {
  @ApiProperty({ description: 'Batch status', enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  @IsIn(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status!: string;
}
