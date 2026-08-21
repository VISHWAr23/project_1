import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UpdateJobWorkOrderDto {
  @ApiPropertyOptional({ description: 'UUID of the Job Working Company' })
  @IsUUID()
  @IsOptional()
  jobWorkCompanyId?: string;

  @ApiPropertyOptional({ description: 'UUID of the Raw Material to issue' })
  @IsUUID()
  @IsOptional()
  rawMaterialId?: string;

  @ApiPropertyOptional({ description: 'UUID of the Target Finished Product' })
  @IsUUID()
  @IsOptional()
  finishedProductId?: string;

  @ApiPropertyOptional({ description: 'Expected return date (ISO string/YYYY-MM-DD)' })
  @IsOptional()
  expectedReturnDate?: string;

  @ApiPropertyOptional({ description: 'Vehicle Registration Number' })
  @IsString()
  @IsOptional()
  vehicleNumber?: string;

  @ApiPropertyOptional({ description: 'Driver Name' })
  @IsString()
  @IsOptional()
  driverName?: string;

  @ApiPropertyOptional({ description: 'Internal remarks or instructions' })
  @IsString()
  @IsOptional()
  remarks?: string;
}
