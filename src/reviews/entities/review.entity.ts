import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity'; // ปรับ path ให้ตรง
import { Room } from '../../rooms/room.entity'; // ปรับ path ให้ตรง

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  review_id: number;

  @Column()
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // ผูกกับ User (ใครรีวิว)
  @Column()
  user_id: number;
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // ผูกกับ Room (รีวิวห้องไหน)
  @Column()
  room_id: number;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room: Room;
}