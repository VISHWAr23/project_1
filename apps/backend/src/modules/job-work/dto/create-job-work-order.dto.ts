import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobWorkOrderDto {
  @ApiProperty({ description: 'UUID of the Job Working Company' })
  @IsUUID()
  @IsNotEmpty()
  jobWorkCompanyId!: string;

  @ApiProperty({ description: 'UUID of the Raw Material to issue' })
  @IsUUID()
  @IsNotEmpty()
  rawMaterialId!: string;

  @ApiPropertyOptional({ description: 'UUID of the Target Finished Product' })
  @IsUUID()
  @IsOptional()
  finishedProductId?: string;

  @ApiProperty({ description: 'Expected return date (ISO string/YYYY-MM-DD)' })
  @IsNotEmpty()
  expectedReturnDate!: string;

  @ApiPropertyOptional({ description: 'Internal remarks or instructions' })
  @IsString()
  @IsOptional()
  remarks?: string;
}
