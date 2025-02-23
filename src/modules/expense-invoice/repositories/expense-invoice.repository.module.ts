import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseInvoiceRepository } from './repository/expense-invoice.repository';
import { ExpenseInvoiceMetaDataRepository } from './repository/expense-invoice-meta-data.repository';
import { ExpenseInvoiceUploadRepository } from './repository/expense-invoice-upload.repository';
import { ExpenseArticleInvoiceEntryRepository } from './repository/expense-invoice-article-entry.repository';
import { ExpenseArticleInvoiceEntryTaxRepository } from './repository/expense-invoice-article-entry-tax.repository';
import { ExpenseInvoiceEntity } from './entities/expense-invoice.entity';
import { ExpenseInvoiceMetaDataEntity } from './entities/expense-invoice-meta-data.entity';
import { ExpenseInvoiceUploadEntity } from './entities/expense-invoice-file.entity';
import { ExpenseArticleInvoiceEntryEntity } from './entities/expense-article-invoice-entry.entity';
import { ExpenseArticleInvoiceEntryTaxEntity } from './entities/expense-article-invoice-entry-tax.entity';


@Module({
  controllers: [],
  providers: [
    ExpenseInvoiceRepository,
    ExpenseInvoiceMetaDataRepository,
    ExpenseInvoiceUploadRepository,
    ExpenseArticleInvoiceEntryRepository,
    ExpenseArticleInvoiceEntryTaxRepository,
  ],
  exports: [
    ExpenseInvoiceRepository,
    ExpenseInvoiceMetaDataRepository,
    ExpenseInvoiceUploadRepository,
    ExpenseArticleInvoiceEntryRepository,
    ExpenseArticleInvoiceEntryTaxRepository,
  ],
  imports: [
    TypeOrmModule.forFeature([ExpenseInvoiceEntity]),
    TypeOrmModule.forFeature([ExpenseInvoiceMetaDataEntity]),
    TypeOrmModule.forFeature([ExpenseInvoiceUploadEntity]),
    TypeOrmModule.forFeature([ExpenseArticleInvoiceEntryEntity]),
    TypeOrmModule.forFeature([ExpenseArticleInvoiceEntryTaxEntity]),
  ],
})
export class ExpenseInvoiceRepositoryModule {}
