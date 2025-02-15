import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { ArticleQuotationEntryEntity } from './article-quotation-entry.entity';
import { TaxEntity } from 'src/modules/tax/repositories/entities/tax.entity';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';

@Entity('article-quotation-entry-tax')
export class ArticleQuotationEntryTaxEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ArticleQuotationEntryEntity)
  @JoinColumn({ name: 'articleQuotationEntryId' })
  articleQuotationEntry: ArticleQuotationEntryEntity;

  @Column({ type: 'int' })
  articleQuotationEntryId: number;

  @ManyToOne(() => TaxEntity)
  @JoinColumn({ name: 'taxId' })
  tax: TaxEntity;

  @Column({ type: 'int' })
  taxId: number;
}
