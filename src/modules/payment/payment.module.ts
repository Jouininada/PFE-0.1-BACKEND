import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { PaymentUploadService } from './services/payment-upload.service';
import { PaymentInvoiceEntryService } from './services/payment-invoice-entry.service';
import { PaymentRepositoryModule } from './repositories/payment.repository.module';
import { StorageModule } from 'src/common/storage/storage.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  controllers: [],
  providers: [PaymentService, PaymentUploadService, PaymentInvoiceEntryService],
  exports: [PaymentService],
  imports: [
    PaymentRepositoryModule,
    CurrencyModule,
    InvoiceModule,
    StorageModule,
  ],
})
export class PaymentModule {}
