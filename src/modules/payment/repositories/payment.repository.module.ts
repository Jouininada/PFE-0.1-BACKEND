import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentRepository } from './repository/payment-file.entity';
import { PaymentInvoiceEntryRepository } from './repository/payment-invoice-entry.entity';
import { PaymentUploadRepository } from './repository/payment.repository';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentInvoiceEntryEntity } from './entities/payment-invoice-entry.entity';
import { PaymentUploadEntity } from './entities/payment-file.entity';

@Module({
  controllers: [],
  providers: [
    PaymentRepository,
    PaymentInvoiceEntryRepository,
    PaymentUploadRepository,
  ],
  exports: [
    PaymentRepository,
    PaymentInvoiceEntryRepository,
    PaymentUploadRepository,
  ],
  imports: [
    TypeOrmModule.forFeature([PaymentEntity]),
    TypeOrmModule.forFeature([PaymentInvoiceEntryEntity]),
    TypeOrmModule.forFeature([PaymentUploadEntity]),
  ],
})
export class PaymentRepositoryModule {}
