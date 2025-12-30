import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) {}

  // สร้างแจ้งเตือน
  async create(userId: number, message: string, type: string = 'info') {
    const notif = this.repo.create({ user_id: userId, message, type });
    return this.repo.save(notif);
  }

  // ดึงแจ้งเตือนของ User คนนั้น (เรียงจากใหม่ไปเก่า)
  async findByUser(userId: number) {
    return this.repo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: 20,
    });
  }

  // กดอ่านแล้ว
  async markAsRead(id: number) {
    return this.repo.update(id, { is_read: true });
  }
}