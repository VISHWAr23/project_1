import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiPropertyOptional({ example: 'CUST-001' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'Apollo Hospitals Group' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Dr. Ramesh Kumar' })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiPropertyOptional({ example: 'procurement@apollohospitals.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+91 98450 12345' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '+91 44 2829 0200' })
  @IsString()
  @IsOptional()
  alternatePhone?: string;

  @ApiPropertyOptional({ example: '33AAACA0000A1Z5' })
  @IsString()
  @IsOptional()
  gstin?: string;

  @ApiPropertyOptional({ example: 'AAACA0000A' })
  @IsString()
  @IsOptional()
  panNo?: string;

  @ApiPropertyOptional({ example: '21 Greams Lane, Off Greams Road, Thousand Lights' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Central Pharmacy Warehouse, Building C, Greams Lane' })
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @ApiPropertyOptional({ example: 'Chennai' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Tamil Nadu' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: '600006' })
  @IsString()
  @IsOptional()
  pinCode?: string;

  @ApiPropertyOptional({ example: 500000 })
  @IsNumber()
  @IsOptional()
  creditLimit?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsNumber()
  @IsOptional()
  creditDays?: number;

  @ApiPropertyOptional({ example: 'Net 30' })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @ApiPropertyOptional({ example: 'HOSPITAL' })
  @IsString()
  @IsOptional()
  customerType?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'Priority tier 1 corporate hospital group' })
  @IsString()
  @IsOptional()
  notes?: string;
}
