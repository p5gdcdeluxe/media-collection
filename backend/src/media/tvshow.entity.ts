import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Media } from './media.entity';

@Entity()
export class TvShow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ean13: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  releaseYear: number;

  @Column({ nullable: true })
  director: string;

  @Column({ nullable: true })
  rating: number;

  @Column({ nullable: true })
  pegiRating: number;

  @Column({ nullable: true })
  genre: string;

  @Column({ nullable: true })
  format: string;

  @Column({ nullable: true })
  edition: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ default: false })
  isLoaned: boolean;

  @Column({ nullable: true })
  customNotes: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  country: string;

  @OneToMany(() => Media, media => media.tvShow)
  seasons: Media[];

  @ManyToOne(() => Media, media => media.tvShows)
  parentMedia: Media;
}