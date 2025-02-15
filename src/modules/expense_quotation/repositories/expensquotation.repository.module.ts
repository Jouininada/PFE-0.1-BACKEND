/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensQuotationEntity } from './entities/expensquotation.entity';
import { ArticleExpensQuotationEntryEntity } from './entities/article-expensquotation-entry.entity';
import { ArticleExpensQuotationEntryTaxRepository } from './repository/article-expensquotation-entry-tax.repository';
import { ArticleExpensQuotationEntryTaxEntity } from './entities/article-expensquotation-entry-tax.entity';
import { ExpensQuotationMetaDataEntity } from './entities/expensquotation-meta-data.entity';
import { ExpensQuotationUploadEntity } from './entities/expensquotation-file.entity';
import { ExpensequotationRepository } from './repository/expensquotation.repository';
import { ExpenseQuotationMetaDataRepository } from './repository/expensquotation-meta-data-repository';
import { ExpensQuotationUploadRepository } from './repository/expensquotation-upload.repository';
import { ExpenseArticleQuotationEntryRepository } from './repository/article-expensquotation-entry.repository';

@Module({
  controllers: [],
  providers: [
    ExpensequotationRepository,
    ExpenseQuotationMetaDataRepository,
    ExpensQuotationUploadRepository,
    ExpenseArticleQuotationEntryRepository,
    ArticleExpensQuotationEntryTaxRepository,
  ],
  exports: [
    ExpensequotationRepository,
    ExpenseQuotationMetaDataRepository,
    ExpensQuotationUploadRepository,
    ExpenseArticleQuotationEntryRepository,
    ArticleExpensQuotationEntryTaxRepository,
  ],
  imports: [
    TypeOrmModule.forFeature([ExpensQuotationEntity]),
    TypeOrmModule.forFeature([ExpensQuotationMetaDataEntity]),
    TypeOrmModule.forFeature([ExpensQuotationUploadEntity]),
    TypeOrmModule.forFeature([ArticleExpensQuotationEntryEntity]),
    TypeOrmModule.forFeature([ArticleExpensQuotationEntryTaxEntity]),
  ],
})
export class QuotationRepositoryModule {}
