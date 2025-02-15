import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PAYMENT_MODE } from '../../enums/payment-mode.enum';
import { PaymentUploadEntity } from './payment-file.entity';
import { PaymentInvoiceEntryEntity } from './payment-invoice-entry.entity';
import { CurrencyEntity } from 'src/modules/currency/repositories/entities/currency.entity';
import { FirmEntity } from 'src/modules/firm/repositories/entities/firm.entity';

@Entity('payment')
export class PaymentEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', nullable: true })
  amount: number;

  @Column({ type: 'float', nullable: true })
  fee: number;

  @Column({ type: 'float', nullable: true })
  convertionRate: number;

  @Column({ nullable: true })
  date: Date;

  @Column({ type: 'enum', enum: PAYMENT_MODE, nullable: true })
  mode: PAYMENT_MODE;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  notes: string;

  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'currencyId' })
  currency: CurrencyEntity;

  @Column({ type: 'int', nullable: true })
  currencyId: number;

  @OneToMany(() => PaymentUploadEntity, (upload) => upload.payment)
  uploads: PaymentUploadEntity[];

  @OneToMany(() => PaymentInvoiceEntryEntity, (invoice) => invoice.payment)
  invoices: PaymentInvoiceEntryEntity[];

  @ManyToOne(() => FirmEntity)
  @JoinColumn({ name: 'firmId' })
  firm: FirmEntity;

  @Column({ type: 'int', nullable: true })
  firmId: number;
}
