import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Room } from '../rooms/room.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  booking_id: number;

  // 👇 1. ต้องเพิ่ม 2 บรรทัดนี้ เพื่อให้ TypeScript รู้จักตัวแปร user_id
  @Column()
  user_id: number;

  @Column()
  room_id: number;

  @Column()
  booking_date: string;

  @Column()
  start_time: string;

  @Column()
  end_time: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_price: number;

  @CreateDateColumn()
  created_at: Date;

  // 👇 2. ตรง Relation ให้ระบุ name ให้ตรงกับ column ด้านบน
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' }) 
  user: User;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room: Room;
}