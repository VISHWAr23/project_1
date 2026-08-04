import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GeneratePayrollDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  year!: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
