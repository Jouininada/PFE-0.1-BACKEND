import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ExpensePaymentInvoiceEntryEntity } from '../entities/expense-payment-invoice-entry.entity';

@Injectable()
export class ExpensePaymentInvoiceEntryRepository extends DatabaseAbstractRepository<ExpensePaymentInvoiceEntryEntity> {
  constructor(
    @InjectRepository(ExpensePaymentInvoiceEntryEntity)
    private readonly expensePaymentInvoiceEntryRepository: Repository<ExpensePaymentInvoiceEntryEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(expensePaymentInvoiceEntryRepository, txHost);
  }
}
