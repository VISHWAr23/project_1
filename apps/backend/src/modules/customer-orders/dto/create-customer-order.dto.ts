import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerOrderItemDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({ example: 'FG-GAUZE-10X10' })
  @IsString()
  @IsOptional()
  itemCode?: string;

  @ApiProperty({ example: 'Sterile Gauze Swabs 10cm x 10cm' })
  @IsString()
  @IsNotEmpty()
  itemName!: string;

  @ApiPropertyOptional({ example: '8 Ply, 100 pcs/box, 100% Cotton' })
  @IsString()
  @IsOptional()
  specification?: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  quantity!: number;

  @ApiPropertyOptional({ example: 'Boxes' })
  @IsString()
  @IsOptional()
  uom?: string;

  @ApiProperty({ example: 450.0 })
  @IsNumber()
  unitPrice!: number;

  @ApiPropertyOptional({ example: 12 })
  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateCustomerOrderDto {
  @ApiPropertyOptional({ example: 'ORD-2026-0001' })
  @IsString()
  @IsOptional()
  orderNumber?: string;

  @ApiProperty({ example: 'uuid-of-customer' })
  @IsUUID()
  @IsNotEmpty()
  customerId!: string;

  @ApiPropertyOptional({ example: '2026-08-27' })
  @IsString()
  @IsOptional()
  orderDate?: string;

  @ApiPropertyOptional({ example: '2026-09-05' })
  @IsString()
  @IsOptional()
  deliveryDueDate?: string;

  @ApiPropertyOptional({ example: 'CONFIRMED' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'NORMAL' })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ example: 'PENDING' })
  @IsString()
  @IsOptional()
  paymentStatus?: string;

  @ApiPropertyOptional({ example: 'BANK_TRANSFER' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  shippingCharges?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @ApiPropertyOptional({ example: 'DL-20B/21B-4492' })
  @IsString()
  @IsOptional()
  dlNo?: string;

  @ApiPropertyOptional({ example: 'REG-TN-2024-889' })
  @IsString()
  @IsOptional()
  regdNo?: string;

  @ApiPropertyOptional({ example: 'VRL Logistics' })
  @IsString()
  @IsOptional()
  transportName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  billingAddress?: string;

  @ApiPropertyOptional({ example: 'ROAD' })
  @IsString()
  @IsOptional()
  transportMode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @ApiPropertyOptional({ example: 'Hospital urgent surgical supplies requirement' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [CreateCustomerOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerOrderItemDto)
  items!: CreateCustomerOrderItemDto[];
}
