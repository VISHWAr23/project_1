import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsInt } from 'class-validator';

export class CreateFabricCostingDto {
  @ApiProperty({ description: 'Quality / Fabric Name', example: 'Gauze Fabric 40s x 40s (780/16/13)' })
  @IsString()
  @IsNotEmpty()
  qualityName!: string;

  @ApiPropertyOptional({ description: 'Optional remarks or specifications' })
  @IsString()
  @IsOptional()
  notes?: string;

  // Primary Specifications
  @ApiProperty({ description: 'Total ends (e.g. 780)', example: 780 })
  @IsInt()
  @Min(1)
  ends!: number;

  @ApiProperty({ description: 'Reed count (e.g. 16)', example: 16 })
  @IsInt()
  @Min(1)
  reed!: number;

  @ApiProperty({ description: 'Picks per inch (e.g. 13)', example: 13 })
  @IsInt()
  @Min(1)
  pick!: number;

  @ApiProperty({ description: 'Total length in meters (e.g. 1000)', example: 1000 })
  @IsNumber()
  @Min(0.01)
  totalLengthMeters!: number;

  @ApiProperty({ description: 'Warp count (e.g. 41)', example: 41 })
  @IsNumber()
  @Min(0.1)
  warpCount!: number;

  @ApiProperty({ description: 'Weft count (e.g. 40)', example: 40 })
  @IsNumber()
  @Min(0.1)
  weftCount!: number;

  // Pricing & Wage Inputs
  @ApiProperty({ description: 'Warp yarn price per kg in ₹ (e.g. 315)', example: 315 })
  @IsNumber()
  @Min(0)
  warpPricePerKg!: number;

  @ApiProperty({ description: 'Weft yarn price per kg in ₹ (e.g. 300)', example: 300 })
  @IsNumber()
  @Min(0)
  weftPricePerKg!: number;

  @ApiProperty({ description: 'Sizing wages per kg in ₹ (e.g. 38.60)', example: 38.6 })
  @IsNumber()
  @Min(0)
  sizingRatePerKg!: number;

  @ApiProperty({ description: 'Weaving wage base per meter in ₹ (e.g. 2.015)', example: 2.015 })
  @IsNumber()
  @Min(0)
  weavingRatePerMeter!: number;

  @ApiProperty({ description: 'Bleaching rate per kg in ₹ (e.g. 57.00)', example: 57 })
  @IsNumber()
  @Min(0)
  bleachingRatePerKg!: number;

  // Circled Constants (Optional overrides, defaults provided)
  @ApiPropertyOptional({ description: 'Yarn constant (default 0.54)', example: 0.54 })
  @IsNumber()
  @IsOptional()
  yarnConstant?: number;

  @ApiPropertyOptional({ description: 'Conversion divisor (default 1000)', example: 1000 })
  @IsNumber()
  @IsOptional()
  conversionDivisor?: number;

  @ApiPropertyOptional({ description: 'Ends deduction for reed space (default 24)', example: 24 })
  @IsInt()
  @IsOptional()
  endsDeduction?: number;

  @ApiPropertyOptional({ description: 'Meter to yard conversion factor (default 1.12)', example: 1.12 })
  @IsNumber()
  @IsOptional()
  meterToYardFactor?: number;

  @ApiPropertyOptional({ description: 'Base reed picks for weaving wages (default 16)', example: 16 })
  @IsInt()
  @IsOptional()
  baseReedPicks?: number;
}

export class CalculateCostingPreviewDto extends CreateFabricCostingDto {}
