import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, IsOptional, IsUUID } from 'class-validator';
import { TransactionType } from '@ims/database';

export class StockTransactionDto {
  @IsEnum(TransactionType)
  @IsNotEmpty()
  transactionType!: TransactionType;

  @IsNumber()
  @Min(0.001, { message: 'Quantity must be greater than 0' })
  quantity!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;

  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @IsString()
  @IsOptional()
  referenceDocumentType?: string;

  @IsUUID()
  @IsOptional()
  referenceDocumentId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
