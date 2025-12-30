import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favRepo: Repository<Favorite>,
  ) {}

  // ฟังก์ชัน Toggle (กดแล้วติด กดอีกทีหลุด)
  async toggle(userId: number, targetId: number, type: string) {
    const existing = await this.favRepo.findOne({
      where: { user_id: userId, target_id: targetId, type },
    });

    if (existing) {
      await this.favRepo.remove(existing);
      return { status: 'removed' };
    } else {
      const fav = this.favRepo.create({ user_id: userId, target_id: targetId, type });
      await this.favRepo.save(fav);
      return { status: 'added' };
    }
  }

  // ดึงรายการที่ User คนนี้กด Like ไว้ทั้งหมด (เพื่อเอาไปโชว์ว่าอันไหนกดแล้ว)
  async getUserFavorites(userId: number) {
    return this.favRepo.find({ where: { user_id: userId } });
  }
}