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

@Entity('expense_article_quotation_entry_tax') // Nom de la table dans la base de données
export class ArticleExpensQuotationEntryTaxEntity extends EntityHelper {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ArticleExpensQuotationEntryEntity)
  @JoinColumn({ name: 'expenseArticleEntryId' }) // Clé étrangère vers ArticleExpensQuotationEntryEntity
  expenseArticleEntry: ArticleExpensQuotationEntryEntity;

  @ManyToOne(() => TaxEntity)
  @JoinColumn({ name: 'taxId' }) // Clé étrangère vers TaxEntity
  tax: TaxEntity;

  // Soft delete et timestamps hérités de EntityHelper

  @Column({ type: 'int' })
  articleExpensQuotationEntryId: number; // Ajoutez ici la colonne

  @Column({ type: 'int' })
  taxId: number; // Clé étrangère pour TaxEntity
}
