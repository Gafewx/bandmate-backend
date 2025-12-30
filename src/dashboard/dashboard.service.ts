import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/booking.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
  ) {}

  async getStats() {
    // 1. รายได้รวมทั้งหมด (เฉพาะสถานะ confirmed หรือ completed)
    const totalRevenueQuery = await this.bookingRepo
      .createQueryBuilder('booking')
      .select('SUM(booking.total_price)', 'total')
      .where('booking.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
      .getRawOne();
      
    // 2. จำนวนการจองทั้งหมด
    const totalBookings = await this.bookingRepo.count();

    // 3. กราฟรายได้ย้อนหลัง 6 เดือน (MySQL)
    const monthlyRevenue = await this.bookingRepo.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_price) as total
      FROM bookings
      WHERE status IN ('confirmed', 'completed')
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `);

    return {
      totalRevenue: parseFloat(totalRevenueQuery.total || '0'), // แปลงเป็นตัวเลข
      totalBookings,
      monthlyRevenue: monthlyRevenue.reverse(), // เรียงจากเก่าไปใหม่ให้กราฟ
    };
  }
}