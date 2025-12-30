import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking } from './booking.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]),
    NotificationsModule,],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule { }