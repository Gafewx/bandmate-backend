import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Band } from './band.entity';
import { User } from '../users/user.entity';

@Entity('band_messages')
export class BandMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column()
  band_id: number;

  @Column()
  user_id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Band)
  @JoinColumn({ name: 'band_id' })
  band: Band;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  sender: User;
}