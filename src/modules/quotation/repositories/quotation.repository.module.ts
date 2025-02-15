import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotationEntity } from './entities/quotation.entity';
import { QuotationRepository } from './repository/quotation.repository';
import { ArticleQuotationEntryRepository } from './repository/article-quotation-entry.repository';
import { ArticleQuotationEntryEntity } from './entities/article-quotation-entry.entity';
import { ArticleQuotationEntryTaxRepository } from './repository/article-quotation-entry-tax.repository';
import { ArticleQuotationEntryTaxEntity } from './entities/article-quotation-entry-tax.entity';
import { QuotationMetaDataRepository } from './repository/quotation-meta-data-repository';
import { QuotationMetaDataEntity } from './entities/quotation-meta-data.entity';
import { QuotationUploadRepository } from './repository/quotation-upload.repository';
import { QuotationUploadEntity } from './entities/quotation-file.entity';

@Module({
  controllers: [],
  providers: [
    QuotationRepository,
    QuotationMetaDataRepository,
    QuotationUploadRepository,
    ArticleQuotationEntryRepository,
    ArticleQuotationEntryTaxRepository,
  ],
  exports: [
    QuotationRepository,
    QuotationMetaDataRepository,
    QuotationUploadRepository,
    ArticleQuotationEntryRepository,
    ArticleQuotationEntryTaxRepository,
  ],
  imports: [
    TypeOrmModule.forFeature([QuotationEntity]),
    TypeOrmModule.forFeature([QuotationMetaDataEntity]),
    TypeOrmModule.forFeature([QuotationUploadEntity]),
    TypeOrmModule.forFeature([ArticleQuotationEntryEntity]),
    TypeOrmModule.forFeature([ArticleQuotationEntryTaxEntity]),
  ],
})
export class QuotationRepositoryModule {}
