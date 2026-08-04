import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { RollStage, RollStatus } from '@ims/database';

export class CreateRollDto {
  @IsString()
  @IsNotEmpty()
  materialName!: string;

  @IsString()
  @IsNotEmpty()
  batchNumber!: string;

  @IsNumber()
  widthInches!: number;

  @IsNumber()
  lengthMeters!: number;

  @IsNumber()
  weightKg!: number;

  @IsOptional()
  @IsNumber()
  gsm?: number;

  @IsOptional()
  @IsEnum(RollStage)
  stage?: RollStage;

  @IsOptional()
  @IsEnum(RollStatus)
  status?: RollStatus;

  @IsString()
  @IsNotEmpty()
  currentLocation!: string;

  @IsOptional()
  @IsUUID()
  parentRollId?: string;

  @IsOptional()
  @IsUUID()
  jobWorkCompanyId?: string;

  @IsOptional()
  @IsUUID()
  productionBatchId?: string;

  @IsOptional()
  @IsUUID()
  finishedProductId?: string;
}
