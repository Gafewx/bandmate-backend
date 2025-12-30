import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Band } from './band.entity';
import { User } from '../users/user.entity';

@Entity('band_members')
export class BandMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  band_id: number;

  @Column()
  user_id: number;

  @Column()
  role: string;

  @Column({ default: 'active' })
  status: string; 

  
  @ManyToOne(() => Band, (band) => band.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'band_id' })
  band: Band;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}