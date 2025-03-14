import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Column,
    OneToOne,
  } from 'typeorm';
  import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
  import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';
import { ExpenseInvoiceEntity } from './expense-invoice.entity';
  
@Entity('expense_invoice_upload')
export class ExpenseInvoiceUploadEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExpenseInvoiceEntity)
  @JoinColumn({ name: 'expenseInvoiceId' })
  expenseInvoice: ExpenseInvoiceEntity;
  @Column({ name: 'expenseInvoiceId' })
  expenseInvoiceId: number;
  

  @ManyToOne(() => UploadEntity)
  @JoinColumn({ name: 'uploadId' })
  upload: UploadEntity;

  @Column({ type: 'int' })
  uploadId: number;

}
