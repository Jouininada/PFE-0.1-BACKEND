import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ExpenseArticleInvoiceEntryTaxEntity } from '../entities/expense-article-invoice-entry-tax.entity';

@Injectable()
export class ExpenseArticleInvoiceEntryTaxRepository extends DatabaseAbstractRepository<ExpenseArticleInvoiceEntryTaxEntity> {
  constructor(
    @InjectRepository(ExpenseArticleInvoiceEntryTaxEntity)
    private readonly articleInvoiceEntryTaxRepository: Repository<ExpenseArticleInvoiceEntryTaxEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleInvoiceEntryTaxRepository, txHost);
  }
}
