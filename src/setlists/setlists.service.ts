import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setlist } from './entities/setlist.entity';
import { Song } from './entities/song.entity';

@Injectable()
export class SetlistsService {
  constructor(
    @InjectRepository(Setlist) private setlistsRepo: Repository<Setlist>,
    @InjectRepository(Song) private songsRepo: Repository<Song>,
  ) {}

  // ดึง Setlist ทั้งหมดของวง
  async findAllByBand(bandId: number) {
    return this.setlistsRepo.find({
      where: { band_id: bandId },
      relations: ['songs'],
      order: { created_at: 'DESC' },
    });
  }

  // สร้าง Setlist ใหม่
  async createSetlist(bandId: number, title: string, targetDate?: string) {
    const setlist = this.setlistsRepo.create({ 
        band_id: bandId, 
        title, 
        target_date: targetDate ? new Date(targetDate) : undefined 
    });
    return this.setlistsRepo.save(setlist);
  }

  // เพิ่มเพลง
  async addSong(setlistId: number, songData: Partial<Song>) {
    const song = this.songsRepo.create({ ...songData, setlist: { setlist_id: setlistId } });
    return this.songsRepo.save(song);
  }

  // อัปเดตสถานะเพลง (ใช้ Socket.io ยิงบอกเพื่อนได้ในอนาคต)
  async updateSongStatus(songId: number, status: string) {
    return this.songsRepo.update(songId, { status });
  }

  // ลบเพลง
  async deleteSong(songId: number) {
    return this.songsRepo.delete(songId);
  }
}