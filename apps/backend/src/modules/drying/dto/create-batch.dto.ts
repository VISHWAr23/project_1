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

export class CreateDryingBatchDto {
  @ApiPropertyOptional({ description: 'Custom batch number (auto-generated if omitted)' })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({ description: 'Product title / name', example: 'Gauze Swab Fabric Drying' })
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @ApiProperty({ description: 'Total pieces for drying', example: 500 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  totalPieces!: number;

  @ApiProperty({ description: 'Piece length', example: 2.5 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  pieceLength!: number;

  @ApiPropertyOptional({ description: 'Piece length UOM', example: 'm', default: 'm' })
  @IsString()
  @IsOptional()
  pieceLengthUom?: string;

  @ApiPropertyOptional({ description: 'Piece width', example: 90 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pieceWidth?: number;

  @ApiPropertyOptional({ description: 'Piece width UOM', example: 'cm', default: 'cm' })
  @IsString()
  @IsOptional()
  pieceWidthUom?: string;

  @ApiPropertyOptional({ description: 'Initially completed pieces', default: 0 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  completedPieces?: number;

  @ApiPropertyOptional({ description: 'Salary wage rate per linear meter (INR)', example: 0.10, default: 0.10 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  salaryRatePerMeter?: number;

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

  @ApiPropertyOptional({ description: 'Output product width specification' })
  @IsString()
  @IsOptional()
  outputProductWidth?: string;

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

export class UpdateDryingProgressDto {
  @ApiProperty({ description: 'Updated count of completed dried pieces', example: 100 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  completedPieces!: number;

  @ApiPropertyOptional({ description: 'Optional status change', enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Wastage or completion notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateDryingStatusDto {
  @ApiProperty({ description: 'Batch status', enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  @IsIn(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status!: string;
}
