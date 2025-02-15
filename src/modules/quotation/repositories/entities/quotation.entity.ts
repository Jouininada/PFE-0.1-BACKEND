import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
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
import { QUOTATION_STATUS } from '../../enums/quotation-status.enum';
import { ArticleQuotationEntryEntity } from './article-quotation-entry.entity';
import { CabinetEntity } from 'src/modules/cabinet/repositories/entities/cabinet.entity';
import { QuotationMetaDataEntity } from './quotation-meta-data.entity';
import { BankAccountEntity } from 'src/modules/bank-account/repositories/entities/bank-account.entity';
import { QuotationUploadEntity } from './quotation-file.entity';
import { InvoiceEntity } from 'src/modules/invoice/repositories/entities/invoice.entity';

@Entity('quotation')
export class QuotationEntity extends EntityHelper {
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

  @Column({ type: 'enum', enum: QUOTATION_STATUS, nullable: true })
  status: QUOTATION_STATUS;

  @Column({ nullable: true })
  discount: number;

  @Column({ type: 'enum', enum: DISCOUNT_TYPES, nullable: true })
  discount_type: DISCOUNT_TYPES;

  @Column({ type: 'float', nullable: true })
  subTotal: number;

  @Column({ type: 'float', nullable: true })
  total: number;

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

  @OneToMany(() => ArticleQuotationEntryEntity, (entry) => entry.quotation)
  articleQuotationEntries: ArticleQuotationEntryEntity[];

  @OneToOne(() => QuotationMetaDataEntity)
  @JoinColumn()
  quotationMetaData: QuotationMetaDataEntity;

  @ManyToOne(() => BankAccountEntity)
  @JoinColumn({ name: 'bankAccountId' })
  bankAccount: BankAccountEntity;

  @Column({ type: 'int' })
  bankAccountId: number;

  @OneToMany(() => QuotationUploadEntity, (upload) => upload.quotation)
  uploads: QuotationUploadEntity[];

  @OneToMany(() => InvoiceEntity, (invoice) => invoice.quotation)
  invoices: InvoiceEntity[];
}
