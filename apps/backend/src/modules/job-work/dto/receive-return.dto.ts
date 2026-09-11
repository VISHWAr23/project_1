import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ValidateNested, Min, IsBoolean } from 'class-validator';

export class ReturnItemDto {
  @ApiProperty({ description: 'Finished Product / Processed Material ID' })
  @IsUUID()
  @IsNotEmpty()
  finishedProductId!: string;

  @ApiProperty({ description: 'Returned Roll Number' })
  @IsString()
  @IsNotEmpty()
  rollNumber!: string;

  @ApiProperty({ description: 'Returned Weight in Kg' })
  @IsNumber()
  @Min(0.001)
  returnedWeight!: number;

  @ApiProperty({ description: 'Returned Quantity' })
  @IsNumber()
  @Min(0.001)
  returnedQty!: number;

  @ApiPropertyOptional({ description: 'Scrap / Wastage Weight in Kg' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  wastageWeight?: number;

  @ApiPropertyOptional({ description: 'Scrap / Wastage Quantity' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  wastageQty?: number;

  @ApiPropertyOptional({ type: [String], description: 'Optional inspection photo URLs' })
  @IsArray()
  @IsOptional()
  photoUrls?: string[];

  @ApiPropertyOptional({ description: 'Roll return notes' })
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class ReceiveReturnDto {
  @ApiProperty({ description: 'Return Date (YYYY-MM-DD)' })
  @IsNotEmpty()
  returnedDate!: string;

  @ApiProperty({ type: [ReturnItemDto], description: 'List of returned rolls' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items!: ReturnItemDto[];

  @ApiPropertyOptional({ description: 'General return batch remarks or final wastage description' })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiPropertyOptional({ description: 'Flag indicating this is the final/last return entry closing the order' })
  @IsBoolean()
  @IsOptional()
  isFinal?: boolean;
}
