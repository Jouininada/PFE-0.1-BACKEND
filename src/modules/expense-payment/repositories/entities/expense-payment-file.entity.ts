import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';
import { ExpensePaymentEntity } from './expense-payment.entity';

@Entity('expense_payment_upload')
export class ExpensePaymentUploadEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExpensePaymentEntity)
  @JoinColumn({ name: 'expensePaymentId' })
  expensePayment: ExpensePaymentEntity;

  @Column({ type: 'int' })
  expensePaymentId: number;

  @ManyToOne(() => UploadEntity)
  @JoinColumn({ name: 'uploadId' })
  upload: UploadEntity;

  @Column({ type: 'int' })
  uploadId: number;
}
