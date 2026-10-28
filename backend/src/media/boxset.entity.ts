import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Media } from './media.entity';

@Entity()
export class BoxSet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Media, media => media.boxSets)
  @JoinTable()
  mediaItems: Media[];
}