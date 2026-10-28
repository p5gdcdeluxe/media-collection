/**
 * Entity representing collection value history records.
 * Tracks the monetary value and size of the collection over time for analytics.
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class CollectionValueHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalValue: number;

  @Column({ type: 'integer' })
  totalItems: number;

  @Column({ type: 'integer' })
  loanedItems: number;

  @CreateDateColumn()
  recordedAt: Date;
}