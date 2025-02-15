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
import { ArticleInvoiceEntryEntity } from './article-invoice-entry.entity';
import { BankAccountEntity } from 'src/modules/bank-account/repositories/entities/bank-account.entity';
import { InvoiceUploadEntity } from './invoice-file.entity';
import { InvoiceMetaDataEntity } from './invoice-meta-data.entity';
import { INVOICE_STATUS } from '../../enums/invoice-status.enum';
import { QuotationEntity } from 'src/modules/quotation/repositories/entities/quotation.entity';
import { TaxEntity } from 'src/modules/tax/repositories/entities/tax.entity';
import { PaymentInvoiceEntryEntity } from 'src/modules/payment/repositories/entities/payment-invoice-entry.entity';
import { TaxWithholdingEntity } from 'src/modules/tax-withholding/repositories/entities/tax-withholding.entity';

@Entity('invoice')
export class InvoiceEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 25, unique: true })
  sequential: string;

  @Column({ nullable: true })
  date: Date;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  object: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  generalConditions: string;

  @Column({ type: 'enum', enum: INVOICE_STATUS, nullable: true })
  status: INVOICE_STATUS;

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

  @OneToMany(() => ArticleInvoiceEntryEntity, (entry) => entry.invoice)
  articleInvoiceEntries: ArticleInvoiceEntryEntity[];

  @OneToOne(() => InvoiceMetaDataEntity)
  @JoinColumn()
  invoiceMetaData: InvoiceMetaDataEntity;

  @ManyToOne(() => BankAccountEntity)
  @JoinColumn({ name: 'bankAccountId' })
  bankAccount: BankAccountEntity;

  @Column({ type: 'int' })
  bankAccountId: number;

  @OneToMany(() => InvoiceUploadEntity, (upload) => upload.invoice)
  uploads: InvoiceUploadEntity[];

  @ManyToOne(() => QuotationEntity)
  @JoinColumn({ name: 'quotationId' })
  quotation: QuotationEntity;

  @Column({ type: 'int', nullable: true })
  quotationId: number;

  @ManyToOne(() => TaxEntity)
  @JoinColumn({ name: 'taxStampId' })
  taxStamp: TaxEntity;

  @Column({ type: 'int' })
  taxStampId: number;

  @OneToMany(() => PaymentInvoiceEntryEntity, (entry) => entry.invoice)
  payments: PaymentInvoiceEntryEntity[];

  @ManyToOne(() => TaxWithholdingEntity)
  @JoinColumn({ name: 'taxWithholdingId' })
  taxWithholding: TaxWithholdingEntity;

  @Column({ type: 'int', nullable: true })
  taxWithholdingId: number;

  @Column({ type: 'float', nullable: true })
  taxWithholdingAmount: number;
}
