import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleQuotationEntryEntity } from '../entities/article-quotation-entry.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class ArticleQuotationEntryRepository extends DatabaseAbstractRepository<ArticleQuotationEntryEntity> {
  constructor(
    @InjectRepository(ArticleQuotationEntryEntity)
    private readonly articleQuotationEntryRepository: Repository<ArticleQuotationEntryEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleQuotationEntryRepository, txHost);
  }
}
