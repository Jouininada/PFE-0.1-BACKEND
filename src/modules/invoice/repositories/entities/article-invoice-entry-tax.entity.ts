import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { TaxEntity } from 'src/modules/tax/repositories/entities/tax.entity';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { ArticleInvoiceEntryEntity } from './article-invoice-entry.entity';

@Entity('article-invoice-entry-tax')
export class ArticleInvoiceEntryTaxEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ArticleInvoiceEntryEntity)
  @JoinColumn({ name: 'articleInvoiceEntryId' })
  articleInvoiceEntry: ArticleInvoiceEntryEntity;

  @Column({ type: 'int' })
  articleInvoiceEntryId: number;

  @ManyToOne(() => TaxEntity)
  @JoinColumn({ name: 'taxId' })
  tax: TaxEntity;

  @Column({ type: 'int' })
  taxId: number;
}
