/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleExpensQuotationEntryTaxEntity } from '../entities/article-expensquotation-entry-tax.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class ArticleExpensQuotationEntryTaxRepository extends DatabaseAbstractRepository<ArticleExpensQuotationEntryTaxEntity> {
  constructor(
    @InjectRepository(ArticleExpensQuotationEntryTaxEntity)
    // Correction du nom de la variable pour correspondre au nom de l'entité
    private readonly articleExpensQuotationEntryTaxRepository: Repository<ArticleExpensQuotationEntryTaxEntity>,
    
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleExpensQuotationEntryTaxRepository, txHost); // Pas de changement ici
  }
}
