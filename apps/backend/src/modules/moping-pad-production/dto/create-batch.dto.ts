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

export class CreateMopingPadBatchDto {
  @ApiPropertyOptional({ description: 'Custom batch number (auto-generated if omitted)' })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({ description: 'Product title / name', example: 'Heavy-Duty Surgical Moping Pad 40cm' })
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @ApiProperty({ description: 'Raw material type', enum: ['ROLL', 'PIECES'], default: 'ROLL' })
  @IsIn(['ROLL', 'PIECES'])
  materialType!: 'ROLL' | 'PIECES';

  // Roll Form attributes
  @ApiPropertyOptional({ description: 'Roll width', example: 100 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  rollWidth?: number;

  @ApiPropertyOptional({ description: 'Roll width UOM', example: 'cm', default: 'cm' })
  @IsString()
  @IsOptional()
  rollWidthUom?: string;

  @ApiPropertyOptional({ description: 'Roll length in meters', example: 150 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  rollLength?: number;

  @ApiPropertyOptional({ description: 'Roll length UOM', example: 'm', default: 'm' })
  @IsString()
  @IsOptional()
  rollLengthUom?: string;

  // Pieces Form attributes
  @ApiPropertyOptional({ description: 'Piece length', example: 40 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pieceLength?: number;

  @ApiPropertyOptional({ description: 'Piece length UOM', example: 'cm', default: 'cm' })
  @IsString()
  @IsOptional()
  pieceLengthUom?: string;

  @ApiPropertyOptional({ description: 'Piece width', example: 30 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pieceWidth?: number;

  @ApiPropertyOptional({ description: 'Piece width UOM', example: 'cm', default: 'cm' })
  @IsString()
  @IsOptional()
  pieceWidthUom?: string;

  @ApiPropertyOptional({ description: 'Piece count', example: 375 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pieceCount?: number;

  // Calculation inputs
  @ApiProperty({ description: 'Pinning size per pad', example: 0.4 })
  @IsNumber()
  @Min(0.001)
  @Type(() => Number)
  pinningSize!: number;

  @ApiPropertyOptional({ description: 'Pinning size UOM', example: 'm', default: 'm' })
  @IsString()
  @IsOptional()
  pinningSizeUom?: string;

  @ApiPropertyOptional({ description: 'Initially completed quantity', default: 0 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  completedQuantity?: number;

  // Workforce / Vendor Assignment
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

  // Notebook / Job Work Parameters
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

  @ApiPropertyOptional({ description: 'Output product width specification' })
  @IsString()
  @IsOptional()
  outputProductWidth?: string;

  // Dates and Notes
  @ApiPropertyOptional({ description: 'Production start date' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Target completion date' })
  @IsDateString()
  @IsOptional()
  targetDate?: string;

  @ApiPropertyOptional({ description: 'Production notes / remarks' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateMopingPadProgressDto {
  @ApiProperty({ description: 'Updated count of completed pads', example: 50 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  completedQuantity!: number;

  @ApiPropertyOptional({ description: 'Optional status change', enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Wastage or completion notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateMopingPadStatusDto {
  @ApiProperty({ description: 'Batch status', enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  @IsIn(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status!: string;
}
