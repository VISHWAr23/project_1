import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAttendanceDto } from './create-attendance.dto';

export class BulkAttendanceDto {
  @ApiProperty({ description: 'Date of attendance for bulk record (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiPropertyOptional({ description: 'Department filter if applicable' })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({ type: [CreateAttendanceDto], description: 'List of attendance entries' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttendanceDto)
  records!: CreateAttendanceDto[];
}
