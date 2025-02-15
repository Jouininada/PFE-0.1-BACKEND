import { Module } from '@nestjs/common';
import { CurrencyModule } from '../currency/currency.module';
import { FirmModule } from '../firm/firm.module';
import { InterlocutorModule } from '../interlocutor/Interlocutor.module';
import { TaxModule } from '../tax/tax.module';
import { ArticleModule } from '../article/article.module';
import { PdfModule } from 'src/common/pdf/pdf.module';
import { CalculationsModule } from 'src/common/calculations/calculations.module';
import { AppConfigModule } from 'src/common/app-config/app-config.module';
import { GatewaysModule } from 'src/common/gateways/gateways.module';
import { BankAccountModule } from '../bank-account/bank-account.module';
import { StorageModule } from 'src/common/storage/storage.module';
import { InvoiceService } from './services/invoice.service';
import { InvoiceMetaDataService } from './services/invoice-meta-data.service';
import { InvoiceUploadService } from './services/invoice-upload.service';
import { InvoiceSequenceService } from './services/invoice-sequence.service';
import { ArticleInvoiceEntryService } from './services/article-invoice-entry.service';
import { ArticleInvoiceEntryTaxService } from './services/article-invoice-entry-tax.service';
import { InvoiceRepositoryModule } from './repositories/invoice.repository.module';
import { TaxWithholdingModule } from '../tax-withholding/tax-withholding.module';

@Module({
  controllers: [],
  providers: [
    InvoiceService,
    InvoiceMetaDataService,
    InvoiceUploadService,
    InvoiceSequenceService,
    ArticleInvoiceEntryService,
    ArticleInvoiceEntryTaxService,
  ],
  exports: [InvoiceService],
  imports: [
    //repositories
    InvoiceRepositoryModule,
    //entities
    ArticleModule,
    AppConfigModule,
    BankAccountModule,
    CurrencyModule,
    FirmModule,
    InterlocutorModule,
    TaxModule,
    TaxWithholdingModule,
    //abstract modules
    PdfModule,
    GatewaysModule,
    CalculationsModule,
    StorageModule,
  ],
})
export class InvoiceModule {}
