import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Song } from './song.entity';

@Entity('setlists')
export class Setlist {
  @PrimaryGeneratedColumn()
  setlist_id: number;

  @Column()
  band_id: number;

  @Column()
  title: string;

  @Column({ type: 'datetime', nullable: true })
  target_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Song, (song) => song.setlist)
  songs: Song[];
}