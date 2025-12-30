import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number; // ใครเป็นคนกด

  @Column()
  target_id: number; // กดให้ใคร (User ID หรือ Room ID)

  @Column()
  type: string; // 'musician' หรือ 'room'

  @CreateDateColumn()
  created_at: Date;
}