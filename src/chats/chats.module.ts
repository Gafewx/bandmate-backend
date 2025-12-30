import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';
// 👇 1. Import ของใหม่
import { ChatsGateway } from './chats.gateway';
import { BandsModule } from '../bands/bands.module'; 

@Module({
  imports: [
    NotificationsModule,
    BandsModule, 
  ],
  controllers: [ChatsController],
  providers: [
    ChatsService, 
    ChatsGateway 
  ],
})
export class ChatsModule {}