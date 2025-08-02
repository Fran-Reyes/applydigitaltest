import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index({ unique: true }) @Column({ type: 'varchar' }) contentfulId: string;
  @Index() @Column({ type: 'varchar' }) name: string;
  @Index()
  @Column({ type: 'varchar', nullable: true })
  category: string | null;
  @Column('numeric', { nullable: true }) price: number | null;
  @Column({ type: 'varchar', nullable: true })
  currency: string | null;
  @Index() @Column({ default: false }) isDeleted: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
