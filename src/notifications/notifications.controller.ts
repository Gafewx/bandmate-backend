import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get('user/:userId') 
  getUserNotifications(@Param('userId') userId: string) {
    return this.service.findByUser(+userId);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body.user_id, body.message, body.type);
  }

  @Patch(':id/read')
  read(@Param('id') id: string) {
    return this.service.markAsRead(+id);
  }
}