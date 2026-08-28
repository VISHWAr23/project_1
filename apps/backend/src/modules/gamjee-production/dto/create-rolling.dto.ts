import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID, IsDateString, IsInt, IsBoolean } from 'class-validator';

export class CreateGamjeeRollingDto {
  @ApiProperty({ description: 'Prepared fabric quantity consumed in meters', example: 960 })
  @IsNumber()
  @Min(0.001)
  fabricInputQuantity!: number;

  @ApiPropertyOptional({ description: 'Fabric UOM', example: 'meter' })
  @IsString()
  @IsOptional()
  fabricInputUom?: string;

  @ApiProperty({ description: 'Cotton quantity consumed in kg', example: 12 })
  @IsNumber()
  @Min(0.001)
  cottonInputQuantity!: number;

  @ApiPropertyOptional({ description: 'Cotton UOM', example: 'kg' })
  @IsString()
  @IsOptional()
  cottonInputUom?: string;

  @ApiProperty({ description: 'Total finished rolls count', example: 120 })
  @IsInt()
  @Min(1)
  finishedRollQuantity!: number;

  @ApiPropertyOptional({ description: 'Finished roll UOM', example: 'Rolls' })
  @IsString()
  @IsOptional()
  finishedRollUom?: string;

  @ApiPropertyOptional({ description: 'Single roll length in meters', example: 8 })
  @IsNumber()
  @Min(0.1)
  @IsOptional()
  finishedRollLength?: number;

  @ApiPropertyOptional({ description: 'Roll length UOM', example: 'm' })
  @IsString()
  @IsOptional()
  finishedRollLengthUom?: string;

  @ApiPropertyOptional({ description: 'Single roll width in cm', example: 15 })
  @IsNumber()
  @Min(0.1)
  @IsOptional()
  finishedRollWidth?: number;

  @ApiPropertyOptional({ description: 'Roll width UOM', example: 'cm' })
  @IsString()
  @IsOptional()
  finishedRollWidthUom?: string;

  @ApiPropertyOptional({ description: 'Wastage quantity in meters/kg', example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  wastageQuantity?: number;

  @ApiPropertyOptional({ description: 'Rejected finished rolls count', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  rejectedRollQuantity?: number;

  @ApiPropertyOptional({ description: 'Operator / Employee UUID' })
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Machine ID / Rolling station' })
  @IsString()
  @IsOptional()
  machineId?: string;

  @ApiProperty({ description: 'Rolling date', example: '2026-08-28' })
  @IsDateString()
  @IsNotEmpty()
  rollingDate!: string;

  @ApiPropertyOptional({ description: 'Finished goods destination warehouse UUID' })
  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @ApiPropertyOptional({ description: 'Notes or remarks' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Auto-mark batch completed upon rolling entry', default: true })
  @IsBoolean()
  @IsOptional()
  markBatchCompleted?: boolean;
}
