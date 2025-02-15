import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InvoiceEntity } from './invoice.entity';

@Entity('invoice_meta_data')
export class InvoiceMetaDataEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => InvoiceEntity, (invoice) => invoice.invoiceMetaData)
  invoice: InvoiceEntity;

  @Column({ type: 'boolean', default: true })
  showInvoiceAddress: boolean;

  @Column({ type: 'boolean', default: true })
  showDeliveryAddress: boolean;

  @Column({ type: 'boolean', default: true })
  showArticleDescription: boolean;

  @Column({ type: 'boolean', default: true })
  hasBankingDetails: boolean;

  @Column({ type: 'boolean', default: true })
  hasGeneralConditions: boolean;

  @Column({ type: 'boolean', default: true })
  hasTaxStamp: boolean;

  @Column({ type: 'boolean', default: true })
  hasTaxWithholding: boolean;

  @Column({ type: 'json', nullable: true })
  taxSummary: any;
}
