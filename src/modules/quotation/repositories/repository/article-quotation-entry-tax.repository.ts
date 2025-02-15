import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleQuotationEntryTaxEntity } from '../entities/article-quotation-entry-tax.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class ArticleQuotationEntryTaxRepository extends DatabaseAbstractRepository<ArticleQuotationEntryTaxEntity> {
  constructor(
    @InjectRepository(ArticleQuotationEntryTaxEntity)
    private readonly articleQuotationEntryTaxRepository: Repository<ArticleQuotationEntryTaxEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleQuotationEntryTaxRepository, txHost);
  }
}
