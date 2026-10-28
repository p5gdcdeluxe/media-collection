import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { BoxSet } from './boxset.entity';

export enum MediaFormat {
  DVD = 'DVD',
  BLURAY = 'BluRay',
  UHD_4K = '4K UHD'
}

export enum MediaType {
  MOVIE = 'Movie',
  TV_SHOW = 'TV Show',
  SEASON = 'Season'
}

@Entity()
export class Media {
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
  format: MediaFormat;

  @Column({ nullable: true })
  edition: string;

  @Column({ nullable: true })
  coverImage: string;

  @ManyToMany(() => Media, { nullable: true })
  @JoinTable()
  collections: Media[];

  @Column({ default: false })
  isLoaned: boolean;

  @Column({ nullable: true })
  customNotes: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'enum', enum: MediaType, default: MediaType.MOVIE })
  type: MediaType;

  @Column({ nullable: true })
  totalSeasons: number;

  @ManyToOne(() => Media, media => media.tvShows, { nullable: true })
  tvShow: Media;

  @OneToMany(() => Media, media => media.tvShow)
  seasons: Media[];

  @OneToMany(() => Wishlist, wishlist => wishlist.media)
  wishlists: Wishlist[];

  @ManyToOne(() => BoxSet, boxSet => boxSet.mediaItems, { nullable: true })
  boxSet: BoxSet;

  @ManyToMany(() => BoxSet)
  @JoinTable()
  boxSets: BoxSet[];
}