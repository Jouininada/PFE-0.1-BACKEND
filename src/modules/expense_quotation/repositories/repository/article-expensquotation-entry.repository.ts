/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleExpensQuotationEntryEntity } from '../entities/article-expensquotation-entry.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class ExpenseArticleQuotationEntryRepository extends DatabaseAbstractRepository<ArticleExpensQuotationEntryEntity> {
  constructor(
    @InjectRepository(ArticleExpensQuotationEntryEntity)
    // Correction du nom de la variable pour correspondre au nom de l'entité
    private readonly articleExpensQuotationEntryRepository: Repository<ArticleExpensQuotationEntryEntity>,
    
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleExpensQuotationEntryRepository, txHost); // Pas de changement ici
  }
}
