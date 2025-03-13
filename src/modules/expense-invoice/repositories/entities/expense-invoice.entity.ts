import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { CabinetEntity } from 'src/modules/cabinet/repositories/entities/cabinet.entity';
import { CurrencyEntity } from 'src/modules/currency/repositories/entities/currency.entity';
import { FirmEntity } from 'src/modules/firm/repositories/entities/firm.entity';
import { InterlocutorEntity } from 'src/modules/interlocutor/repositories/entity/interlocutor.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BankAccountEntity } from 'src/modules/bank-account/repositories/entities/bank-account.entity';
import { ExpenseArticleInvoiceEntryEntity } from './expense-article-invoice-entry.entity';
import { ExpenseInvoiceMetaDataEntity } from './expense-invoice-meta-data.entity';
import { ExpenseInvoiceUploadEntity } from './expense-invoice-file.entity';
import { TaxEntity } from 'src/modules/tax/repositories/entities/tax.entity';
import { TaxWithholdingEntity } from 'src/modules/tax-withholding/repositories/entities/tax-withholding.entity';
import { EXPENSE_INVOICE_STATUS } from '../../enums/expense-invoice-status.enum';
import { ExpensQuotationEntity } from 'src/modules/expense_quotation/repositories/entities/expensquotation.entity';
import { ExpensePaymentInvoiceEntryEntity } from 'src/modules/expense-payment/repositories/entities/expense-payment-invoice-entry.entity';
import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';

@Entity('expense_invoice')
export class ExpenseInvoiceEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 25, unique: true,nullable:true})
  sequential: string;
  

  @Column({ nullable: true })
  date: Date;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  object: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  generalConditions: string;

  @Column({ type: 'enum', enum: EXPENSE_INVOICE_STATUS, nullable: true })
  status: EXPENSE_INVOICE_STATUS;

  @Column({ nullable: true })
  discount: number;

  @Column({ type: 'enum', enum: DISCOUNT_TYPES, nullable: true })
  discount_type: DISCOUNT_TYPES;

  @Column({ type: 'float', nullable: true })
  subTotal: number;

  @Column({ type: 'float', nullable: true })
  total: number;

  @Column({ type: 'float', nullable: true })
  amountPaid: number;

  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'currencyId' })
  currency: CurrencyEntity;

  @Column({ type: 'int' })
  currencyId: number;

  @ManyToOne(() => FirmEntity)
  @JoinColumn({ name: 'firmId' })
  firm: FirmEntity;

  @Column({ type: 'int' })
  firmId: number;

  @ManyToOne(() => InterlocutorEntity)
  @JoinColumn({ name: 'interlocutorId' })
  interlocutor: InterlocutorEntity;

  @ManyToOne(() => CabinetEntity)
  @JoinColumn({ name: 'cabinetId' })
  cabinet: CabinetEntity;

  @Column({ type: 'int', default: 1 })
  cabinetId: number;

  @Column({ type: 'int' })
  interlocutorId: number;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  notes: string;

  @OneToMany(() =>ExpenseArticleInvoiceEntryEntity, (entry) => entry.expenseInvoice)
  articleExpenseEntries: ExpenseArticleInvoiceEntryEntity[];

  @OneToOne(() => ExpenseInvoiceMetaDataEntity)
  @JoinColumn()
  expenseInvoiceMetaData: ExpenseInvoiceMetaDataEntity;

  @ManyToOne(() => BankAccountEntity)
  @JoinColumn({ name: 'bankAccountId' })
  bankAccount: BankAccountEntity;

  @Column({ type: 'int' })
  bankAccountId: number;

  @OneToMany(() => ExpenseInvoiceUploadEntity, (upload) => upload.expenseInvoice)
  uploads: ExpenseInvoiceUploadEntity[];

  @ManyToOne(() => ExpensQuotationEntity)
@JoinColumn({ name: 'quotationId' })  // Assurez-vous d'utiliser le bon nom de colonne
quotation: ExpensQuotationEntity;

  @Column({ type: 'int', nullable: true })
  quotationId: number;  

  @ManyToOne(() => TaxEntity)
  @JoinColumn({ name: 'taxStampId' })
  taxStamp: TaxEntity;

  @Column({ type: 'int' })
  taxStampId: number;



  @OneToMany(() => ExpensePaymentInvoiceEntryEntity, (entry) => entry.expenseInvoice)
payments: ExpensePaymentInvoiceEntryEntity[];

  @ManyToOne(() => TaxWithholdingEntity)
  @JoinColumn({ name: 'taxWithholdingId' })
  taxWithholding: TaxWithholdingEntity;

  @Column({ type: 'int', nullable: true })
  taxWithholdingId: number;

  @Column({ type: 'float', nullable: true })
  taxWithholdingAmount: number;
  
  @Column({ type: 'varchar', length: 25, nullable: true })
sequentialNumbr: string;

//ajout au migration!
@OneToOne(() => UploadEntity, { nullable: true })
@JoinColumn({ name: 'pdfFileId' })
uploadPdfField: UploadEntity;

@Column({ type: 'int', nullable: true })
pdfFileId: number;
}

