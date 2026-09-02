import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationType, NotificationSeverity } from '@ims/database';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications with optional filters' })
  @ApiQuery({ name: 'type', enum: NotificationType, required: false })
  @ApiQuery({ name: 'severity', enum: NotificationSeverity, required: false })
  @ApiQuery({ name: 'isRead', type: Boolean, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async findAll(
    @Query('type') type?: NotificationType,
    @Query('severity') severity?: NotificationSeverity,
    @Query('isRead') isRead?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    const isReadBool = isRead !== undefined ? isRead === 'true' : undefined;
    return this.notificationsService.findAll({
      type,
      severity,
      isRead: isReadBool,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      userId: req?.user?.id,
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get total unread notifications count for live badge' })
  async getUnreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(req?.user?.id);
  }

  @Post('sync-alerts')
  @ApiOperation({ summary: 'Scan operational database and generate latest system alerts' })
  async syncAlerts() {
    return this.notificationsService.generateSystemAlerts();
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all unread notifications as read' })
  async markAllRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req?.user?.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create manual notification / alert' })
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark specific notification as read' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  async remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
