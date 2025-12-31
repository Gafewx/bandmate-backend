import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Setlist } from './setlist.entity';

@Entity('songs')
export class Song {
    @PrimaryGeneratedColumn()
    song_id: number;

    @Column()
    title: string;

    @Column({ nullable: true })
    artist: string;

    @Column({ nullable: true })
    key: string;

    @Column({ nullable: true })
    youtube_link: string;

    @Column({ type: 'int', default: 0 })
    sequence: number;

    @Column({ type: 'text', nullable: true })
    lyrics: string;

    @Column({ default: 'pending' })
    status: string;

    @ManyToOne(() => Setlist, (setlist) => setlist.songs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'setlist_id' })
    setlist: Setlist;
}