import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number; // แจ้งเตือนนี้ส่งหาใคร

  @Column()
  message: string; // ข้อความ เช่น "การจองของคุณได้รับอนุมัติแล้ว"

  @Column({ default: 'info' }) 
  type: string; // info, success, warning

  @Column({ default: false })
  is_read: boolean; // อ่านหรือยัง?

  @CreateDateColumn()
  created_at: Date;
}