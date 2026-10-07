import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ValidateNested, Min } from 'class-validator';

export class IssueItemDto {
  @ApiProperty({ description: 'Roll Number / Serial' })
  @IsString()
  @IsNotEmpty()
  rollNumber!: string;

  @ApiPropertyOptional({ description: 'Batch ID if tracked' })
  @IsUUID()
  @IsOptional()
  batchId?: string;

  @ApiProperty({ description: 'Issued Weight in Kg' })
  @IsNumber()
  @Min(0.001)
  issuedWeight!: number;

  @ApiProperty({ description: 'Issued Quantity in units/meters' })
  @IsNumber()
  @Min(0.001)
  issuedQty!: number;

  @ApiPropertyOptional({ description: 'Item level notes' })
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class IssueMaterialsDto {
  @ApiProperty({ description: 'Vehicle Registration Number' })
  @IsString()
  @IsNotEmpty()
  vehicleNumber!: string;

  @ApiProperty({ description: 'Transport Driver Name' })
  @IsString()
  @IsNotEmpty()
  driverName!: string;

  @ApiPropertyOptional({ description: 'Delivery Challan (DC) reference number (e.g. DC-05 or 05)' })
  @IsString()
  @IsOptional()
  dcNo?: string;

  @ApiPropertyOptional({ description: 'Delivery Challan (DC) dispatch date' })
  @IsString()
  @IsOptional()
  dcDate?: string;

  @ApiPropertyOptional({ description: 'Delivery person name' })
  @IsString()
  @IsOptional()
  deliveryPerson?: string;

  @ApiPropertyOptional({ description: 'Ends count' })
  @IsString()
  @IsOptional()
  ends?: string;

  @ApiPropertyOptional({ description: 'Item type' })
  @IsString()
  @IsOptional()
  itemType?: string;

  @ApiPropertyOptional({ description: 'Output product width' })
  @IsString()
  @IsOptional()
  outputProductWidth?: string;

  @ApiPropertyOptional({ description: 'Delivery Challan remarks' })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty({ type: [IssueItemDto], description: 'List of rolls issued' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IssueItemDto)
  items!: IssueItemDto[];
}
