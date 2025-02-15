import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { ArticleEntity } from 'src/modules/article/repositories/entities/article.entity';
import { QuotationEntity } from 'src/modules/quotation/repositories/entities/quotation.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ArticleQuotationEntryTaxEntity } from './article-quotation-entry-tax.entity';

@Entity('article-quotation-entry')
export class ArticleQuotationEntryEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', nullable: true })
  unit_price: number;

  @Column({ type: 'float', nullable: true })
  quantity: number;

  @Column({ type: 'float', nullable: true })
  discount: number;

  @Column({ type: 'enum', enum: DISCOUNT_TYPES, nullable: true })
  discount_type: DISCOUNT_TYPES;

  @Column({ type: 'float', nullable: true })
  subTotal: number;

  @Column({ type: 'float', nullable: true })
  total: number;

  @ManyToOne(() => ArticleEntity)
  @JoinColumn({ name: 'articleId' })
  article: ArticleEntity;

  @Column({ type: 'int', nullable: true })
  articleId: number;

  @ManyToOne(() => QuotationEntity)
  @JoinColumn({ name: 'quotationId' })
  quotation: QuotationEntity;

  @Column({ type: 'int', nullable: true })
  quotationId: number;

  @OneToMany(
    () => ArticleQuotationEntryTaxEntity,
    (articleQuotationEntryTax) =>
      articleQuotationEntryTax.articleQuotationEntry,
  )
  articleQuotationEntryTaxes: ArticleQuotationEntryTaxEntity[];
}
