import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MarkBreakdownItemDto {
  @ApiProperty({ description: 'Mark value (e.g. 56, 55, 60)' })
  @IsNumber()
  mark!: number;

  @ApiProperty({ description: 'Number of Paavu / sets (e.g. 6, 3, 1)' })
  @IsNumber()
  paavu!: number;

  @ApiPropertyOptional({ description: 'Calculated pieces for this mark (mark * paavu)' })
  @IsNumber()
  @IsOptional()
  pieces?: number;
}

export class CreateWeavingJobWorkDto {
  @ApiProperty({ description: 'UUID of the Job Working Company' })
  @IsUUID()
  @IsNotEmpty()
  jobWorkCompanyId!: string;

  @ApiPropertyOptional({ description: 'Optional UUID of Raw Material (Warp Yarn/Beams)' })
  @IsUUID()
  @IsOptional()
  rawMaterialId?: string;

  @ApiProperty({ description: 'Expected return date (YYYY-MM-DD)' })
  @IsNotEmpty()
  expectedReturnDate!: string;

  @ApiPropertyOptional({ description: 'Remarks or instructions' })
  @IsString()
  @IsOptional()
  remarks?: string;

  // Weaving Parameters
  @ApiProperty({ description: 'Ends count (e.g. 1260)' })
  @IsNumber()
  ends!: number;

  @ApiProperty({ description: 'Reed count (e.g. 23)' })
  @IsNumber()
  reed!: number;

  @ApiProperty({ description: 'Pick count (e.g. 17)' })
  @IsNumber()
  pick!: number;

  @ApiProperty({ description: 'Total Paavu count (e.g. 10)' })
  @IsNumber()
  totalPaavu!: number;

  @ApiPropertyOptional({ description: 'Piece length in yards (default 112)' })
  @IsNumber()
  @IsOptional()
  pieceLengthYards?: number;

  @ApiPropertyOptional({ description: 'Piece length in meters (default 100)' })
  @IsNumber()
  @IsOptional()
  pieceLengthMeters?: number;

  @ApiProperty({ description: 'Weft count (e.g. 40s)' })
  @IsNumber()
  weftCount!: number;

  @ApiPropertyOptional({ description: 'Warp count (optional)' })
  @IsNumber()
  @IsOptional()
  warpCount?: number;

  @ApiPropertyOptional({ description: 'Yarn constant (default 0.54)' })
  @IsNumber()
  @IsOptional()
  yarnConstant?: number;

  @ApiProperty({ description: 'Mark breakdown items (Mark * Paavu = Pieces)' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarkBreakdownItemDto)
  markBreakdown!: MarkBreakdownItemDto[];

  @ApiProperty({ description: 'Total Pieces (e.g. 561)' })
  @IsNumber()
  totalPieces!: number;

  @ApiProperty({ description: 'Weft Weight per Piece in Kg (e.g. 1.406)' })
  @IsNumber()
  weftWeightPerPieceKg!: number;

  @ApiProperty({ description: 'Total Weft Weight in Kg (e.g. 788.766)' })
  @IsNumber()
  totalWeftWeightKg!: number;

  @ApiPropertyOptional({ description: 'Warp Weight in Kg (optional, default 0)' })
  @IsNumber()
  @IsOptional()
  warpWeightKg?: number;

  @ApiProperty({ description: 'Total Receivable Weight in Kg' })
  @IsNumber()
  totalReceivableWeightKg!: number;

  // Salary Parameters
  @ApiProperty({ description: 'Salary type (Roll, Than, Custom)' })
  @IsIn(['Roll', 'Than', 'Custom'])
  salaryType!: string;

  @ApiProperty({ description: 'Rate per meter in INR (e.g. 2.015 for Roll, 2.095 for Than)' })
  @IsNumber()
  ratePerMeter!: number;

  @ApiPropertyOptional({ description: 'Base reed picks divisor (default 16)' })
  @IsNumber()
  @IsOptional()
  baseReedPicks?: number;

  @ApiProperty({ description: 'Salary per piece in INR (e.g. 214.092)' })
  @IsNumber()
  salaryPerPiece!: number;

  @ApiProperty({ description: 'Total Salary in INR (e.g. 120105.61)' })
  @IsNumber()
  totalSalary!: number;
}
