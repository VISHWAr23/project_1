import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsUUID, IsNumber, ValidateIf } from 'class-validator';
import { EmployeeStatus } from '@ims/database';

export class CreateEmployeeDto {
  @ApiPropertyOptional({ description: 'Custom or Auto Employee Code' })
  @IsString()
  @IsOptional()
  employeeCode?: string;

  @ApiProperty({ description: 'First Name' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ description: 'Last Name' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional({ description: 'Primary Phone Number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Alternate Phone Number' })
  @IsString()
  @IsOptional()
  alternatePhone?: string;

  @ApiPropertyOptional({ description: 'Email Address' })
  @ValidateIf(o => o.email !== '')
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Avatar / Profile Picture URL' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Gender' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'Date of Birth (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  dob?: string;

  @ApiPropertyOptional({ description: 'Blood Group' })
  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'State' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'PIN Code' })
  @IsString()
  @IsOptional()
  pinCode?: string;

  @ApiPropertyOptional({ description: 'Emergency Contact Person Name' })
  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @ApiPropertyOptional({ description: 'Emergency Contact Phone' })
  @IsString()
  @IsOptional()
  emergencyPhone?: string;

  @ApiPropertyOptional({ description: 'Aadhaar Card Number' })
  @IsString()
  @IsOptional()
  aadhaarNo?: string;

  @ApiPropertyOptional({ description: 'PAN Card Number' })
  @IsString()
  @IsOptional()
  panNo?: string;

  @ApiProperty({ description: 'Joining Date (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  joiningDate!: string;

  @ApiPropertyOptional({ description: 'Employment Type (Permanent, Contract, Temporary)' })
  @IsString()
  @IsOptional()
  employmentType?: string;

  @ApiPropertyOptional({ description: 'Work Shift' })
  @IsString()
  @IsOptional()
  shift?: string;

  @ApiPropertyOptional({ description: 'Salary Structure Type (Monthly Salary / Daily Wage)' })
  @IsString()
  @IsOptional()
  salaryType?: string;

  @ApiPropertyOptional({ description: 'Base Wage or Salary Amount' })
  @IsNumber()
  @IsOptional()
  baseWage?: number;


  @ApiPropertyOptional({ description: 'Bank Name' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({ description: 'Bank Account Number' })
  @IsString()
  @IsOptional()
  bankAccountNo?: string;

  @ApiPropertyOptional({ description: 'Bank IFSC Code' })
  @IsString()
  @IsOptional()
  bankIfsc?: string;

  @ApiPropertyOptional({ description: 'UPI ID' })
  @IsString()
  @IsOptional()
  upiId?: string;

  @ApiPropertyOptional({ description: 'Department UUID' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Designation UUID' })
  @IsUUID()
  @IsOptional()
  designationId?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}
