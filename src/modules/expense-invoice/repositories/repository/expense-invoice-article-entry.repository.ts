import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ExpenseArticleInvoiceEntryEntity } from '../entities/expense-article-invoice-entry.entity';

@Injectable()
export class ExpenseArticleInvoiceEntryRepository extends DatabaseAbstractRepository<ExpenseArticleInvoiceEntryEntity> {
  constructor(
    @InjectRepository(ExpenseArticleInvoiceEntryEntity)
    private readonly articleInvoiceEntryRepository: Repository<ExpenseArticleInvoiceEntryEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleInvoiceEntryRepository, txHost);
  }
}
