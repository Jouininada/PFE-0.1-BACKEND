import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { ArticleExpensQuotationEntryEntity } from './article-expensquotation-entry.entity';
import { TaxEntity } from 'src/modules/tax/repositories/entities/tax.entity';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';

@Entity('expense_article_quotation_entry_tax') // Match the table name in SQL
export class ArticleExpensQuotationEntryTaxEntity extends EntityHelper {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ArticleExpensQuotationEntryEntity)
  @JoinColumn({ name: 'expenseArticleEntryId' }) // Foreign key
  expenseArticleEntry: ArticleExpensQuotationEntryEntity;

  @ManyToOne(() => TaxEntity)
  @JoinColumn({ name: 'taxId' }) // Foreign key
  tax: TaxEntity;

  // Soft delete and timestamps inherited from EntityHelper

  @Column({ type: 'int' })
  articleExpensQuotationEntryId:number;

  @Column({ type: 'int' })
  taxId: number;
}
