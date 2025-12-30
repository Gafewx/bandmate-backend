import { Controller, Post, Get, Patch, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import type { Response } from 'express';

@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Post()
  async create(@Body() body: any, @Res() res: Response) {
    try {
      const booking = await this.bookingsService.create(body);
      return res.status(HttpStatus.OK).json({ message: 'Booking pending approval', booking });
    } catch (error: any) {
      console.error(error);
      const message = error.message || 'Booking failed';
      return res.status(HttpStatus.BAD_REQUEST).json({ message });
    }
  }

  @Get('user/:id')
  async getUserBookings(@Param('id') id: string) {
    return this.bookingsService.findByUser(+id);
  }

  // 👇 1. API ดึงรายการจองสำหรับ Owner
  @Get('owner/:id')
  async getOwnerBookings(@Param('id') id: string) {
    return this.bookingsService.findOwnerBookings(+id);
  }

  @Get('room/:id')
  async getRoomBookings(@Param('id') id: string) {
    return this.bookingsService.findByRoom(+id);
  }

  @Post('checkin')
  async checkIn(@Body() body: { booking_id: number }) {
    return this.bookingsService.checkIn(body.booking_id);
  }

  @Patch(':id/user-cancel')
  async userCancel(@Param('id') id: string, @Body('userId') userId: number) {
    return this.bookingsService.cancelBooking(+id, userId);
  }

  // 👇 2. API อัปเดตสถานะ (Approve/Reject)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; owner_id: number }
  ) {
    // ส่ง owner_id เข้าไปให้ Service ตรวจสอบ
    return this.bookingsService.updateStatus(+id, body.status, body.owner_id);
  }
}