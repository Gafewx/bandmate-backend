import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) { }

  // 🟢 1. ดึงทั้งหมด: ต้องคืนค่าเป็น "Room[]" (มีวงเล็บก้ามปู แปลว่า Array/หลายห้อง)
  async findAll() {
    // ใช้ Raw SQL เพื่อ Join ตาราง Reviews และคำนวณค่าเฉลี่ย (AVG)
    // COALESCE(..., 0) แปลว่า ถ้าไม่มีรีวิว ให้ถือว่าเป็น 0 คะแนน
    return this.roomsRepository.query(
      `SELECT r.*, 
       COALESCE(AVG(rv.rating), 0) as average_rating,
       COUNT(rv.review_id) as review_count
       FROM rooms r
       LEFT JOIN reviews rv ON r.room_id = rv.room_id
       GROUP BY r.room_id`
    );
  }

  // 🟢 2. หาห้องเดียว: คืนค่าเป็น "Room" หรือ null (ไม่มีวงเล็บก้ามปู)
  findOne(id: number): Promise<Room | null> {
    return this.roomsRepository.findOneBy({ room_id: id });
  }

  // 🟢 3. สร้างห้องใหม่: คืนค่าเป็น "Room" (ห้องเดียวที่เพิ่งสร้างเสร็จ)
  create(data: any): Promise<Room[]> {
    const newRoom = this.roomsRepository.create(data);
    return this.roomsRepository.save(newRoom);
  }

  // 🟢 4. ลบห้อง: ไม่คืนค่าอะไร (void)
  async remove(id: number): Promise<void> {
    await this.roomsRepository.delete(id);
  }
}