import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Band } from './band.entity';
import { User } from '../users/user.entity'; // Import User Entity เดิมของคุณ

@Entity('band_members')
export class BandMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  band_id: number;

  @Column()
  user_id: number;

  @Column({ default: 'member' }) // leader, member
  role: string;

  @Column({ default: 'active' }) // active, pending, left
  status: string;

  @ManyToOne(() => Band, (band) => band.members)
  @JoinColumn({ name: 'band_id' })
  band: Band;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}