import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import Modules ต่างๆ
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ChatsModule } from './chats/chats.module';
import { BandsModule } from './bands/bands.module';
import { SetlistsModule } from './setlists/setlists.module';
import { SchedulesModule } from './schedules/schedules.module';
// Import Entities
import { User } from './users/user.entity';
import { Room } from './rooms/room.entity';
import { Booking } from './bookings/booking.entity';
import { Review } from './reviews/entities/review.entity';
import { Notification } from './notifications/notification.entity';
import { Favorite } from './favorites/favorite.entity';
import { Band } from './bands/band.entity';
import { BandMember } from './bands/band-member.entity';
import { BandMessage } from './bands/band-message.entity';
// 👇 เพิ่ม 2 บรรทัดนี้ (Entities ของ Setlist)
import { Setlist } from './setlists/entities/setlist.entity';
import { Song } from './setlists/entities/song.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bandmate_db',
      entities: [
        User, 
        Room, 
        Booking, 
        Review, 
        Notification, 
        Favorite, 
        Band, 
        BandMember, 
        BandMessage,
        Setlist,
        Song
      ],
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false,
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    RoomsModule,
    BookingsModule,
    ReviewsModule,
    NotificationsModule,
    DashboardModule,
    FavoritesModule,
    ChatsModule,
    BandsModule,
    SetlistsModule,
    SchedulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }