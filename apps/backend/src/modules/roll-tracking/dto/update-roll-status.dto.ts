import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { RollStatus } from '@ims/database';

export class UpdateRollStatusDto {
  @IsEnum(RollStatus)
  @IsNotEmpty()
  status!: RollStatus;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsString()
  @IsNotEmpty()
  performedBy!: string;
}
