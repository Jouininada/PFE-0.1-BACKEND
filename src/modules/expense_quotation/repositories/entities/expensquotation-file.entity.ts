import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { ExpensQuotationEntity } from './expensquotation.entity';
import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';

@Entity('expense_quotation_upload') // Match the table name in SQL
export class ExpensQuotationUploadEntity extends EntityHelper {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExpensQuotationEntity)
  @JoinColumn({ name: 'expensequotationId' }) // Foreign key
  expenseQuotation: ExpensQuotationEntity;

  @Column({ type: 'int' })
  expensequotationId: number;

  @ManyToOne(() => UploadEntity)
  @JoinColumn({ name: 'uploadId' }) // Foreign key
  upload: UploadEntity;

  @Column({ type: 'int' })
  uploadId: number;

  // Soft delete and timestamps inherited from EntityHelper
}
