import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensePaymentRepository } from './repository/expense-payment-file.entity';
import { ExpensePaymentInvoiceEntryRepository } from './repository/expense-payment-invoice-entry.entity';
import { ExpensePaymentUploadRepository } from './repository/expense-payment.repository';
import { ExpensePaymentEntity } from './entities/expense-payment.entity';
import { ExpensePaymentInvoiceEntryEntity } from './entities/expense-payment-invoice-entry.entity';
import { ExpensePaymentUploadEntity } from './entities/expense-payment-file.entity';


@Module({
  controllers: [],
  providers: [
    ExpensePaymentRepository,
    ExpensePaymentInvoiceEntryRepository,
    ExpensePaymentUploadRepository,
  ],
  exports: [
    ExpensePaymentRepository,
    ExpensePaymentInvoiceEntryRepository,
    ExpensePaymentUploadRepository,
  ],
  imports: [
    TypeOrmModule.forFeature([ExpensePaymentEntity]),
    TypeOrmModule.forFeature([ExpensePaymentInvoiceEntryEntity]),
    TypeOrmModule.forFeature([ExpensePaymentUploadEntity]),
  ],
})
export class ExpensePaymentRepositoryModule {}
