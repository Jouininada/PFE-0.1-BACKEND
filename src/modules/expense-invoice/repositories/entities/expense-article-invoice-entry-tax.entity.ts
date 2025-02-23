import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Column,
  } from 'typeorm';
  import { TaxEntity } from 'src/modules/tax/repositories/entities/tax.entity';
  import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
  import { ExpenseArticleInvoiceEntryEntity } from './expense-article-invoice-entry.entity';
  
  @Entity('article-expense-invoice-entry-tax')
export class ExpenseArticleInvoiceEntryTaxEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExpenseArticleInvoiceEntryEntity, { nullable: false })
@JoinColumn({ name: 'articleExpenseInvoiceEntryId' })
expenseArticleInvoiceEntry: ExpenseArticleInvoiceEntryEntity;

@Column({ type: 'int', name: 'articleExpenseInvoiceEntryId' })
expenseArticleInvoiceEntryId: number;


  @ManyToOne(() => TaxEntity, { nullable: false })
  @JoinColumn({ name: 'taxId' })
  tax: TaxEntity;

  @Column({ type: 'int', name: 'taxId' })
  taxId: number;
}

  
  