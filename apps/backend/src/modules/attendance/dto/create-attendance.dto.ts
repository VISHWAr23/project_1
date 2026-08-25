import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { AttendanceStatus } from '@ims/database';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'UUID of the Employee' })
  @IsUUID()
  @IsNotEmpty()
  employeeId!: string;

  @ApiPropertyOptional({ description: 'Date of attendance (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ description: 'Check In Time (ISO string or HH:mm)' })
  @IsString()
  @IsOptional()
  checkIn?: string;

  @ApiPropertyOptional({ description: 'Check Out Time (ISO string or HH:mm)' })
  @IsString()
  @IsOptional()
  checkOut?: string;

  @ApiPropertyOptional({ description: 'Lunch Break Start Time (ISO string or HH:mm)' })
  @IsString()
  @IsOptional()
  lunchStart?: string;

  @ApiPropertyOptional({ description: 'Lunch Break End Time (ISO string or HH:mm)' })
  @IsString()
  @IsOptional()
  lunchEnd?: string;

  @ApiProperty({ enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @ApiPropertyOptional({ description: 'Regular Working Hours (up to 8.5h)' })
  @IsNumber()
  @IsOptional()
  workingHours?: number;

  @ApiPropertyOptional({ description: 'Overtime Hours' })
  @IsNumber()
  @IsOptional()
  overtimeHours?: number;

  @ApiPropertyOptional({ description: 'Calculated OT Amount (INR)' })
  @IsNumber()
  @IsOptional()
  otAmount?: number;

  @ApiPropertyOptional({ description: 'Remarks' })
  @IsString()
  @IsOptional()
  remarks?: string;
}
