import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  full_name: string;

  @Column({ default: 'musician' })
  role: string;

  // คอลัมน์ที่อนุญาตให้ว่างได้ (nullable: true)
  @Column({ nullable: true })
  instrument: string;

  @Column({ nullable: true })
  genres: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true })
  profile_img: string;

  @Column({ nullable: true })
  youtube_link: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: true })
  is_looking_for_band: boolean;

  @Column({ type: 'int', default: 50 })
  skill_solo: number;

  @Column({ type: 'int', default: 50 })
  skill_rhythm: number;

  @Column({ type: 'int', default: 50 })
  skill_theory: number;

  @Column({ type: 'int', default: 50 })
  skill_live: number;

  @Column({ type: 'int', default: 50 })
  skill_ear: number;
}