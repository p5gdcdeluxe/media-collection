import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Media } from './media.entity';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @ManyToOne(() => Media, media => media.wishlists)
  @JoinColumn()
  media: Media;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ nullable: true })
  notes: string;
}