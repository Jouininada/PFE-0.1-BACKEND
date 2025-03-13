import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  OneToOne,
} from 'typeorm';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { ExpensQuotationEntity } from './expensquotation.entity';
import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';

@Entity('expense_quotation_upload')
export class ExpensQuotationUploadEntity extends EntityHelper {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExpensQuotationEntity)
  @JoinColumn({ name: 'expensequotationId' })
  expenseQuotation: ExpensQuotationEntity;

  @Column({ type: 'int' })
  expensequotationId: number;

  @ManyToOne(() => UploadEntity)
  @JoinColumn({ name: 'uploadId' })
  upload: UploadEntity;

  @Column({ type: 'int' })
  uploadId: number;
}
