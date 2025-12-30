import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  // ---------------------------------------------------------
  // 👇 1. (เพิ่มใหม่) ฟังก์ชันค้นหานักดนตรีสำหรับหน้า Home
  // ---------------------------------------------------------
  async findAllMusicians(search: string) {
    const query = this.usersRepository.createQueryBuilder('user');

    // กรองเอาเฉพาะคนที่ "กำลังหาวง" (is_looking_for_band = true)
    query.where('user.is_looking_for_band = :isLooking', { isLooking: true });

    // ถ้ามีคำค้นหา ให้หาจาก ชื่อ หรือ เครื่องดนตรี
    if (search) {
      query.andWhere(
        '(user.full_name LIKE :search OR user.instrument LIKE :search)',
        { search: `%${search}%` }
      );
    }

    return query.orderBy('user.created_at', 'DESC').getMany();
  }

  // ---------------------------------------------------------
  // 👇 2. (เพิ่มใหม่) ฟังก์ชัน Matching คำนวณ % ความเข้ากันได้
  // ---------------------------------------------------------
  async findMatch(currentUserId: number) {
    // 1. ดึงข้อมูลตัวเราเอง
    const me = await this.usersRepository.findOneBy({ user_id: currentUserId });
    if (!me || !me.genres) return [];

    const myGenres = me.genres.toLowerCase().split(',').map(g => g.trim());

    // 2. ดึงคนอื่นที่หาวงอยู่ (ตรวจสอบให้แน่ใจว่าใน Entity มีคอลัมน์เหล่านี้)
    const others = await this.usersRepository.find({
      where: { is_looking_for_band: true }
    });

    // 3. วนลูปให้คะแนนและเพิ่มข้อมูล Skills
    const matches = others
      .filter(user => user.user_id !== currentUserId)
      .map(user => {
        if (!user.genres) return { ...user, score: 0, common: [] };

        const theirGenres = user.genres.toLowerCase().split(',').map(g => g.trim());
        const commonGenres = myGenres.filter(g => theirGenres.includes(g));

        let score = 0;
        if (myGenres.length > 0) {
          score = Math.round((commonGenres.length / myGenres.length) * 100);
        }

        // 👇 ส่งข้อมูล Skills ออกไปด้วย เพื่อใช้ทำ Radar Chart
        return {
          ...user,
          score,
          common: commonGenres,
          // ตรวจสอบชื่อคอลัมน์ให้ตรงกับในฐานข้อมูลของคุณ
          skill_solo: user.skill_solo ?? 50,
          skill_rhythm: user.skill_rhythm ?? 50,
          skill_theory: user.skill_theory ?? 50,
          skill_live: user.skill_live ?? 50,
          skill_ear: user.skill_ear ?? 50
        };
      })
      .filter(user => user.score > 0)
      .sort((a, b) => b.score - a.score);

    return matches;
  }

  // ---------------------------------------------------------
  // 👇 ส่วนเดิม (พื้นฐาน CRUD) เก็บไว้เหมือนเดิมครับ
  // ---------------------------------------------------------

  async findAll(query?: string): Promise<User[]> {
    if (!query) {
      return this.usersRepository.find();
    }
    return this.usersRepository.find({
      where: [
        { full_name: Like(`%${query}%`) },
        { instrument: Like(`%${query}%`) },
        { genres: Like(`%${query}%`) }
      ]
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { user_id: id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  async update(id: number, data: any) {
    // แยก password ออกเพื่อไม่ให้อัปเดต (ถ้าจะแก้รหัสผ่านควรทำแยก)
    const { password, ...updateData } = data;
    return this.usersRepository.update(id, updateData);
  }
}