import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({ description: 'Type of Document (e.g. Aadhaar Card, PAN Card, Passbook)' })
  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @ApiProperty({ description: 'Original File Name' })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({ description: 'Public Storage / File Download URL' })
  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @ApiPropertyOptional({ description: 'Storage path inside Supabase bucket' })
  @IsString()
  @IsOptional()
  storagePath?: string;
}
