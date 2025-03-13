import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { CurrencyEntity } from 'src/modules/currency/repositories/entities/currency.entity';
import { FirmEntity } from 'src/modules/firm/repositories/entities/firm.entity';
import { InterlocutorEntity } from 'src/modules/interlocutor/repositories/entity/interlocutor.entity';
import { EXPENSQUOTATION_STATUS } from '../../enums/expensquotation-status.enum';
import { CabinetEntity } from 'src/modules/cabinet/repositories/entities/cabinet.entity';
import { ExpensQuotationMetaDataEntity } from './expensquotation-meta-data.entity';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { ArticleExpensQuotationEntryEntity } from './article-expensquotation-entry.entity';
import { BankAccountEntity } from 'src/modules/bank-account/repositories/entities/bank-account.entity';
import { ExpensQuotationUploadEntity } from './expensquotation-file.entity';
import { ExpenseInvoiceEntity } from 'src/modules/expense-invoice/repositories/entities/expense-invoice.entity';
import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';

@Entity('expense_quotation')
export class ExpensQuotationEntity extends EntityHelper {

  @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 25, unique: true,nullable:true })
    sequential: string;
  
    @Column({ nullable: true })
    date: Date;
  
    @Column({ nullable: true })
    dueDate: Date;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    object: string;
  
    @Column({ type: 'varchar', length: 1024, nullable: true })
    generalConditions: string;
  
    @Column({ type: 'enum', enum: EXPENSQUOTATION_STATUS, nullable: true })
    status: EXPENSQUOTATION_STATUS;
  
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

  @Column({ type: 'float', nullable: true })
  taxStamp: number;

  // Relation avec BankAccountEntity
  @ManyToOne(() => BankAccountEntity)
  @JoinColumn({ name: "bankAccountId" })
  bankAccount: BankAccountEntity;

// Dans ExpensQuotationEntity
@OneToMany(() => ArticleExpensQuotationEntryEntity, (entry) => entry.expenseQuotation)
expensearticleQuotationEntries: ArticleExpensQuotationEntryEntity[];


  // Relation avec ExpensQuotationMetaDataEntity
  @OneToOne(() => ExpensQuotationMetaDataEntity)
  @JoinColumn({ name: "expenseMetaDataId" })  // Associer la clé avec la colonne ID
  expensequotationMetaData: ExpensQuotationMetaDataEntity;

  @Column({ type: 'int', nullable: true })
  expenseMetaDataId: number;

  @Column({ type: 'int' })
  bankAccountId: number;

  @OneToMany(() => ExpensQuotationUploadEntity, (upload) => upload.expenseQuotation)
  uploads: ExpensQuotationUploadEntity[];

  @OneToMany(() => ExpenseInvoiceEntity, (invoice) => invoice.quotation)

  invoices: ExpenseInvoiceEntity[];

  @Column({ type: 'varchar', length: 25, nullable: true })
  sequentialNumbr: string;

  @OneToOne(() => UploadEntity, { nullable: true })
  @JoinColumn({ name: 'pdfFileId' })
  uploadPdfField: UploadEntity;
  
  @Column({ type: 'int', nullable: true })
  pdfFileId: number;
}
