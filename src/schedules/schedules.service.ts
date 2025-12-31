import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './schedule.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private repo: Repository<Schedule>,
  ) {}

  // ดึงตารางเวลาทั้งหมดของวง (เพื่อเอามาทำ Heatmap)
  async getBandSchedule(bandId: number) {
    return this.repo.find({ where: { band_id: bandId } });
  }

  // บันทึกเวลาของฉัน (ลบของเก่าทิ้ง แล้วใส่ใหม่)
  async saveMySchedule(bandId: number, userId: number, slots: string[]) {
    // 1. ลบเวลาเดิมของ user นี้ในวงนี้ทิ้งก่อน (Reset)
    await this.repo.delete({ band_id: bandId, user_id: userId });

    // 2. แปลงจาก string "0-10" เป็น Entity แล้วบันทึก
    if (slots.length > 0) {
      const entities = slots.map((slot) => {
        const [day, hour] = slot.split('-').map(Number);
        return this.repo.create({ band_id: bandId, user_id: userId, day, hour });
      });
      await this.repo.save(entities);
    }

    return { success: true };
  }
}