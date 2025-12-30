import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private notificationsService: NotificationsService,
  ) { }

  async create(data: any): Promise<Booking> {
    const start = new Date(data.start_time);
    const end = new Date(data.end_time);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('รูปแบบวันที่ไม่ถูกต้อง');
    }

    if (start >= end) {
      throw new BadRequestException('เวลาเริ่มซ้อมต้องมาก่อนเวลาเลิกครับ');
    }

    // ตรวจสอบการจองชน (Overlap)
    const existingBooking = await this.bookingsRepository.query(
      `SELECT * FROM bookings 
       WHERE room_id = ? 
       AND status != 'rejected'
       AND (start_time < ? AND end_time > ?)`,
      [data.room_id, end, start]
    );

    if (existingBooking.length > 0) {
      console.log('❌ ชนกับรายการนี้:', existingBooking[0]);
      throw new BadRequestException('เวลานี้มีคนจองไปแล้วครับ (Time Overlap)');
    }

    // คำนวณราคา
    const diffHours = Math.abs(end.getTime() - start.getTime()) / 36e5;
    const total_price = diffHours * data.price_per_hour;

    // สร้าง Booking
    const newBooking = this.bookingsRepository.create({
      user_id: data.user_id,
      room_id: data.room_id,
      booking_date: start.toISOString().split('T')[0],
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      total_price: total_price,
      status: 'pending'
    });

    return this.bookingsRepository.save(newBooking);
  }

  async findOwnerBookings(ownerId: number) {
    return this.bookingsRepository.query(
      `SELECT b.*, r.room_name, u.full_name as customer_name
       FROM bookings b
       JOIN rooms r ON b.room_id = r.room_id
       JOIN users u ON b.user_id = u.user_id
       WHERE r.owner_id = ?
       ORDER BY b.start_time ASC`,
      [ownerId]
    );
  }

  async findByUser(userId: number) {
    return this.bookingsRepository.query(
      `SELECT b.*, r.room_name, r.room_img, r.location 
       FROM bookings b 
       JOIN rooms r ON b.room_id = r.room_id 
       WHERE b.user_id = ? 
       ORDER BY b.start_time DESC`,
      [userId]
    );
  }

  // 👇👇👇 จุดที่แก้ไขหลักครับ (รับ ownerId เพิ่ม + เช็คสิทธิ์) 👇👇👇
  async updateStatus(id: number, status: string, ownerId: number) {

    // 1. 🛡️ เช็คก่อนว่า Owner คนนี้ เป็นเจ้าของห้องที่ถูกจองนี้จริงไหม?
    const checkResult = await this.bookingsRepository.query(
      `SELECT COUNT(*) as count
         FROM bookings b
         JOIN rooms r ON b.room_id = r.room_id
         WHERE b.booking_id = ? AND r.owner_id = ?`,
      [id, ownerId]
    );

    // ค่า count ที่ได้จาก query บางทีเป็น string '0' หรือ number 0 ต้องแปลงให้ชัวร์
    if (Number(checkResult[0].count) === 0) {
      throw new BadRequestException('⛔ คุณไม่มีสิทธิ์จัดการรายการจองของร้านอื่น!');
    }

    // 2. ✅ ถ้าผ่าน (เป็นเจ้าของจริง) ค่อยอัปเดตสถานะ
    await this.bookingsRepository.update(id, { status });

    // 3. แจ้งเตือนลูกค้า
    const booking = await this.bookingsRepository.findOne({ where: { booking_id: id } });
    if (booking) {
      let message = '';
      if (status === 'confirmed') message = `✅ การจองห้องของคุณได้รับการอนุมัติแล้ว!`;
      if (status === 'rejected') message = `❌ การจองห้องของคุณถูกปฏิเสธ`;

      if (message) {
        await this.notificationsService.create(booking.user_id, message, status === 'confirmed' ? 'success' : 'error');
      }
    }
  }
  // 👆👆👆 จบส่วนแก้ไข 👆👆👆

  async findByRoom(roomId: number) {
    return this.bookingsRepository.query(
      `SELECT booking_id, start_time, end_time, status 
       FROM bookings 
       WHERE room_id = ? 
       AND status != 'rejected'`,
      [roomId]
    );
  }

  async cancelBooking(id: number, userId: number) {
    // 1. ตรวจสอบข้อมูลการจอง และสิทธิ์ของลูกค้า
    const bookingData = await this.bookingsRepository.query(
      `SELECT b.*, r.room_name, r.owner_id 
       FROM bookings b
       JOIN rooms r ON b.room_id = r.room_id
       WHERE b.booking_id = ? AND b.user_id = ?`,
      [id, userId]
    );

    if (bookingData.length === 0) {
      throw new BadRequestException('❌ ไม่พบข้อมูลการจองของคุณ');
    }

    const booking = bookingData[0];

    // 2. เช็คสถานะ (ยกเลิกได้เฉพาะตอนที่ยังเป็น pending หรือ confirmed)
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      throw new BadRequestException(`⚠️ ไม่สามารถยกเลิกได้เนื่องจากสถานะคือ: ${booking.status}`);
    }

    // 3. อัปเดตสถานะเป็น cancelled
    await this.bookingsRepository.update(id, { status: 'cancelled' });

    // 4. 🔔 แจ้งเตือนเจ้าของห้อง (Owner) ว่ามีลูกค้ากดยกเลิก
    const cancelMessage = `🚫 ลูกค้าได้ยกเลิกการจองห้อง ${booking.room_name} (ID: ${id})`;
    await this.notificationsService.create(
      booking.owner_id,
      cancelMessage,
      'error' // ใช้สีแดงเพื่อให้เจ้าของห้องสังเกตง่าย
    );

    return { success: true, message: 'ยกเลิกการจองเรียบร้อยแล้ว' };
  }

  async checkIn(bookingId: number) {
    const booking = await this.bookingsRepository.findOne({ where: { booking_id: bookingId } });

    if (!booking) {
      throw new BadRequestException('❌ ไม่พบข้อมูลการจอง');
    }

    if (booking.status === 'completed') {
      throw new BadRequestException('⚠️ ตั๋วใบนี้ถูกใช้งานไปแล้วครับ (Duplicate Entry)');
    }

    if (booking.status !== 'confirmed') {
      throw new BadRequestException(`❌ เข้าใช้งานไม่ได้ สถานะตั๋วคือ: ${booking.status}`);
    }

    booking.status = 'completed';
    await this.bookingsRepository.save(booking);

    return {
      success: true,
      message: '✅ เช็คอินสำเร็จ! ยินดีต้อนรับครับ',
      data: booking
    };
  }
}