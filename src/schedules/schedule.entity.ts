import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  band_id: number;

  @Column()
  day: number; // 0=จันทร์, 1=อังคาร, ...

  @Column()
  hour: number; // 10, 11, 12, ...
}