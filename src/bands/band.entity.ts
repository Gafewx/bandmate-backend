import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BandMember } from './band-member.entity';

@Entity('bands')
export class Band {
  @PrimaryGeneratedColumn()
  band_id: number;

  @Column()
  band_name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  band_img: string; // URL รูปวง

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => BandMember, (member) => member.band)
  members: BandMember[];
}