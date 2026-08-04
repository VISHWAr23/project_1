import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class CloseJobWorkOrderDto {
  @ApiPropertyOptional({ description: 'Closing remarks or variance explanation' })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty({ description: 'Explicit confirmation flag to close work order' })
  @IsBoolean()
  confirmed!: boolean;
}
