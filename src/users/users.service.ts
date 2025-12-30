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
  // 👇 1. ฟังก์ชันค้นหานักดนตรีสำหรับหน้า Home (Search)
  // ---------------------------------------------------------
  async findAllMusicians(search: string) {
    const query = this.usersRepository.createQueryBuilder('user');
    query.where('user.is_looking_for_band = :isLooking', { isLooking: true });

    if (search) {
      query.andWhere(
        '(user.full_name LIKE :search OR user.instrument LIKE :search)',
        { search: `%${search}%` }
      );
    }
    return query.orderBy('user.created_at', 'DESC').getMany();
  }

  // ---------------------------------------------------------
  // 👇 2. (อัปเกรด) Advanced AI Matching Algorithm 🚀
  // ---------------------------------------------------------
  async findMatch(currentUserId: number) {
    // 1. ดึงข้อมูลตัวเราเอง
    const me = await this.usersRepository.findOneBy({ user_id: currentUserId });
    if (!me || !me.genres) return [];

    const myGenres = me.genres.toLowerCase().split(',').map(g => g.trim());
    const mySkills = [me.skill_solo, me.skill_rhythm, me.skill_theory, me.skill_live, me.skill_ear];

    // 2. ดึงคนอื่นที่หาวงอยู่
    const others = await this.usersRepository.find({
      where: { is_looking_for_band: true }
    });

    // 3. คำนวณคะแนน (Algorithm)
    const matches = others
      .filter(user => user.user_id !== currentUserId)
      .map(user => {
        // --- A. Genre Score (Jaccard Similarity) ---
        if (!user.genres) return { ...user, score: 0, common: [] };
        const theirGenres = user.genres.toLowerCase().split(',').map(g => g.trim());
        const commonGenres = myGenres.filter(g => theirGenres.includes(g));
        const allUniqueGenres = new Set([...myGenres, ...theirGenres]);
        const genreScore = (commonGenres.length / allUniqueGenres.size) * 100;

        // --- B. Skill Score (Vector Similarity) ---
        const theirSkills = [user.skill_solo, user.skill_rhythm, user.skill_theory, user.skill_live, user.skill_ear];
        const totalDiff = mySkills.reduce((sum, skill, index) => {
          return sum + Math.abs(skill - (theirSkills[index] || 50));
        }, 0);
        const skillSimilarity = Math.max(0, 100 - (totalDiff / 5));

        // --- C. Role Bonus ---
        const isDifferentInstrument = me.instrument !== user.instrument;
        const roleBonus = isDifferentInstrument ? 10 : 0;

        // --- D. Final Weighted Score ---
        // (Genre 50% + Skill 40% + Bonus 10%)
        let finalScore = (genreScore * 0.5) + (skillSimilarity * 0.4) + roleBonus;
        finalScore = Math.min(Math.round(finalScore), 100);

        return {
          ...user,
          score: finalScore,
          common: commonGenres,
          // ส่งค่า Skill กลับไปทำกราฟ
          skill_solo: user.skill_solo ?? 50,
          skill_rhythm: user.skill_rhythm ?? 50,
          skill_theory: user.skill_theory ?? 50,
          skill_live: user.skill_live ?? 50,
          skill_ear: user.skill_ear ?? 50,
          // ส่งค่า Skill Match ไปโชว์หน้าเว็บ
          skill_match_percent: Math.round(skillSimilarity) 
        };
      })
      .filter(user => user.score > 30) // Match เกิน 30% ถึงจะโชว์
      .sort((a, b) => b.score - a.score);

    return matches;
  }

  // ---------------------------------------------------------
  // 👇 CRUD พื้นฐาน
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
    const { password, ...updateData } = data;
    return this.usersRepository.update(id, updateData);
  }
}