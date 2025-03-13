import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ExpenseArticleInvoiceEntryTaxEntity } from './expense-article-invoice-entry-tax.entity';
import { ExpenseInvoiceEntity } from './expense-invoice.entity';
import { ArticleEntity } from 'src/modules/article/repositories/entities/article.entity';

@Entity('article-expense-invoice-entry')
export class ExpenseArticleInvoiceEntryEntity extends EntityHelper {
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

  @ManyToOne(() => ExpenseInvoiceEntity)
  @JoinColumn({ name: 'expenseInvoiceId' })  
  expenseInvoice: ExpenseInvoiceEntity;
  

@Column({ type: 'int', nullable: true })
expenseInvoiceId: number;

@Column({ type: 'float', nullable: true })
amount: number;


  @OneToMany(
    () => ExpenseArticleInvoiceEntryTaxEntity,
    (expenseArticleInvoiceEntryTax) => expenseArticleInvoiceEntryTax.expenseArticleInvoiceEntry,
  )
  expenseArticleInvoiceEntryTaxes: ExpenseArticleInvoiceEntryTaxEntity[];

}
