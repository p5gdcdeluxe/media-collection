/**
 * Entity representing loan history records for media items.
 * Tracks when items are borrowed and returned, including borrower information.
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Media } from './media.entity';

@Entity()
export class LoanHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Media, { nullable: false })
  media: Media;

  @Column()
  userId: string;

  @Column({ nullable: true })
  borrowerName: string;

  @Column({ type: 'timestamp' })
  loanDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  returnDate: Date;

  @Column({ default: false })
  isReturned: boolean;

  @CreateDateColumn()
  createdAt: Date;
}