import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  room_id: number;

  @Column()
  owner_id: number; // จริงๆ ควรทำ Relation แต่เอาแบบง่ายๆ ก่อนครับ

  @Column()
  room_name: string;

  @Column({ type: 'text' })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 }) // เก็บจุดทศนิยม
  price_per_hour: number;

  @Column()
  location: string;

  @Column()
  room_img: string;
}