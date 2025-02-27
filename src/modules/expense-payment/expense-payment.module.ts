import { Module } from '@nestjs/common';

import { StorageModule } from 'src/common/storage/storage.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { CurrencyModule } from '../currency/currency.module';
import { ExpensePaymentRepositoryModule } from './repositories/expense-payment.repository.module';
import { ExpensePaymentService } from './services/expense-payment.service';
import { ExpensePaymentUploadService } from './services/expense-payment-upload.service';
import { ExpensePaymentInvoiceEntryService } from './services/expense-payment-invoice-entry.service';
import { ExpenseInvoiceModule } from '../expense-invoice/expense-invoice.module';

@Module({
  controllers: [],
  providers: [ExpensePaymentService, ExpensePaymentUploadService, ExpensePaymentInvoiceEntryService],
  exports: [ExpensePaymentService],
  imports: [
    ExpensePaymentRepositoryModule,
    CurrencyModule,
    ExpenseInvoiceModule,
    StorageModule,
  ],
})
export class ExpensePaymentModule {}
