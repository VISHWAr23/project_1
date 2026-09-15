import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsIn,
  Min,
} from 'class-validator';

export class CreateBleachingJobWorkDto {
  @ApiProperty({ description: 'UUID of the Job Working Company / Bleaching Mill' })
  @IsUUID()
  @IsNotEmpty()
  jobWorkCompanyId!: string;

  @ApiPropertyOptional({ description: 'Expected return date (YYYY-MM-DD)' })
  @IsNotEmpty()
  expectedReturnDate!: string;

  @ApiPropertyOptional({ description: 'Remarks or special processing instructions' })
  @IsString()
  @IsOptional()
  remarks?: string;

  // Bleaching Process Specifications
  @ApiProperty({
    description: 'Bleaching type: BEAM_DYEING or PEROXIDE_BLEACHING',
    enum: ['BEAM_DYEING', 'PEROXIDE_BLEACHING'],
  })
  @IsIn(['BEAM_DYEING', 'PEROXIDE_BLEACHING'])
  bleachingType!: 'BEAM_DYEING' | 'PEROXIDE_BLEACHING';

  @ApiPropertyOptional({
    description: 'Cost rate type: PER_KG or PER_METER',
    enum: ['PER_KG', 'PER_METER'],
    default: 'PER_KG',
  })
  @IsIn(['PER_KG', 'PER_METER'])
  @IsOptional()
  rateType?: 'PER_KG' | 'PER_METER';

  @ApiProperty({ description: 'Cost rate per KG or Meter in INR (e.g. 57.00 or 20.00)' })
  @IsNumber()
  @Min(0.01)
  rate!: number;

  @ApiPropertyOptional({ description: 'Expected process loss / shrinkage percentage (default 3.0%)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  processLossPercentage?: number;

  @ApiPropertyOptional({ description: 'Beam number (especially for Beam Dyeing)' })
  @IsString()
  @IsOptional()
  beamNumber?: string;

  @ApiPropertyOptional({ description: 'Chemical recipe or formula notes (e.g. H2O2 + Caustic)' })
  @IsString()
  @IsOptional()
  chemicalFormula?: string;

  // Selected Weaving In-Pass Received Products
  @ApiProperty({ description: 'Array of WeavingReceivedItem UUIDs sourced into this bleaching lot' })
  @IsArray()
  @IsUUID('all', { each: true })
  selectedWeavingItemIds!: string[];

  // Calculated Totals
  @ApiProperty({ description: 'Total input weight from selected weaving items in KG' })
  @IsNumber()
  @Min(0.001)
  totalInputWeightKg!: number;

  @ApiPropertyOptional({ description: 'Total input length in meters' })
  @IsNumber()
  @IsOptional()
  totalInputLengthMeters?: number;

  @ApiProperty({ description: 'Total rolls or pieces sourced' })
  @IsNumber()
  @Min(1)
  totalPiecesOrRolls!: number;

  @ApiProperty({ description: 'Expected output bleached weight in KG after shrinkage' })
  @IsNumber()
  @Min(0.001)
  expectedOutputWeightKg!: number;

  @ApiProperty({ description: 'Total estimated bleaching cost in INR' })
  @IsNumber()
  @Min(0.01)
  totalCost!: number;
}
