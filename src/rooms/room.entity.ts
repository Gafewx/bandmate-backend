import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  room_id: number;

  @Column()
  owner_id: number;

  @Column()
  room_name: string;

  @Column({ type: 'text', nullable: true }) // แนะนำให้ใส่ nullable เผื่อบางห้องไม่มีคำอธิบาย
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price_per_hour: number;

  @Column()
  location: string;

  @Column({ nullable: true })
  room_img: string;

  @Column({ default: true }) 
  is_active: boolean;

  @Column({ type: 'int', default: 5 }) 
  capacity: number;
}