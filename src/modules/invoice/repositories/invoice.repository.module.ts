import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceRepository } from './repository/invoice.repository';
import { InvoiceMetaDataRepository } from './repository/invoice-meta-data.repository';
import { InvoiceUploadRepository } from './repository/invoice-upload.repository';
import { ArticleInvoiceEntryRepository } from './repository/article-invoice-entry.repository';
import { ArticleInvoiceEntryTaxRepository } from './repository/article-invoice-entry-tax.repository';
import { InvoiceEntity } from './entities/invoice.entity';
import { InvoiceMetaDataEntity } from './entities/invoice-meta-data.entity';
import { InvoiceUploadEntity } from './entities/invoice-file.entity';
import { ArticleInvoiceEntryEntity } from './entities/article-invoice-entry.entity';
import { ArticleInvoiceEntryTaxEntity } from './entities/article-invoice-entry-tax.entity';

@Module({
  controllers: [],
  providers: [
    InvoiceRepository,
    InvoiceMetaDataRepository,
    InvoiceUploadRepository,
    ArticleInvoiceEntryRepository,
    ArticleInvoiceEntryTaxRepository,
  ],
  exports: [
    InvoiceRepository,
    InvoiceMetaDataRepository,
    InvoiceUploadRepository,
    ArticleInvoiceEntryRepository,
    ArticleInvoiceEntryTaxRepository,
  ],
  imports: [
    TypeOrmModule.forFeature([InvoiceEntity]),
    TypeOrmModule.forFeature([InvoiceMetaDataEntity]),
    TypeOrmModule.forFeature([InvoiceUploadEntity]),
    TypeOrmModule.forFeature([ArticleInvoiceEntryEntity]),
    TypeOrmModule.forFeature([ArticleInvoiceEntryTaxEntity]),
  ],
})
export class InvoiceRepositoryModule {}
