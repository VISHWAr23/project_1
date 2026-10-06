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

export class CreateGauzePadPinningBatchDto {
  @ApiPropertyOptional({ description: 'Custom batch number (auto-generated if omitted)' })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({ description: 'Product title / name', example: 'Sterile Gauze Swab Pad' })
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @ApiProperty({ description: 'Raw material input type', enum: ['ROLL', 'PIECES'], default: 'ROLL' })
  @IsIn(['ROLL', 'PIECES'])
  materialType!: 'ROLL' | 'PIECES';

  // Roll Form
  @ApiPropertyOptional({ description: 'Roll width', example: 100 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  rollWidth?: number;

  @ApiPropertyOptional({ description: 'Roll width UOM', example: 'cm', default: 'cm' })
  @IsString()
  @IsOptional()
  rollWidthUom?: string;

  @ApiPropertyOptional({ description: 'Roll length', example: 120 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  rollLength?: number;

  @ApiPropertyOptional({ description: 'Roll length UOM', example: 'm', default: 'm' })
  @IsString()
  @IsOptional()
  rollLengthUom?: string;

  // Pieces Form
  @ApiPropertyOptional({ description: 'Piece length', example: 50 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pieceLength?: number;

  @ApiPropertyOptional({ description: 'Piece length UOM', example: 'cm', default: 'cm' })
  @IsString()
  @IsOptional()
  pieceLengthUom?: string;

  @ApiPropertyOptional({ description: 'Piece width', example: 50 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pieceWidth?: number;

  @ApiPropertyOptional({ description: 'Piece width UOM', example: 'cm', default: 'cm' })
  @IsString()
  @IsOptional()
  pieceWidthUom?: string;

  @ApiPropertyOptional({ description: 'Total pieces count', example: 200 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pieceCount?: number;

  // Operations: Pinning Size & Cutting Size
  @ApiProperty({ description: 'Pinning size / folding length', example: 30 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  pinningSize!: number;

  @ApiPropertyOptional({ description: 'Pinning size UOM', example: 'cm', default: 'cm' })
  @IsString()
  @IsOptional()
  pinningSizeUom?: string;

  @ApiProperty({ description: 'Cutting size / division factor', example: 2, default: 1 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  cuttingSize!: number;

  // Salary Engine
  @ApiPropertyOptional({ description: 'Salary wage rate per finished piece (INR)', example: 1.5, default: 0 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  salaryRatePerPiece?: number;

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

export class UpdateGauzePadPinningStatusDto {
  @ApiProperty({ description: 'Batch status', enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  @IsIn(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status!: string;
}
