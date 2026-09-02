import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationType, NotificationSeverity } from '@ims/database';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Notification detail message' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({ enum: NotificationType, default: NotificationType.SYSTEM })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @ApiPropertyOptional({ enum: NotificationSeverity, default: NotificationSeverity.INFO })
  @IsEnum(NotificationSeverity)
  @IsOptional()
  severity?: NotificationSeverity;

  @ApiPropertyOptional({ description: 'Direct link to resource' })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({ description: 'Target user ID' })
  @IsString()
  @IsOptional()
  userId?: string;
}
