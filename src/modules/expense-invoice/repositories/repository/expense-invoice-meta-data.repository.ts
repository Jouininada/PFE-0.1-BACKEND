import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ExpenseInvoiceMetaDataEntity } from '../entities/expense-invoice-meta-data.entity';

@Injectable()
export class ExpenseInvoiceMetaDataRepository extends DatabaseAbstractRepository<ExpenseInvoiceMetaDataEntity> {
  constructor(
    @InjectRepository(ExpenseInvoiceMetaDataEntity)
    private readonly invoiceMetaDataRespository: Repository<ExpenseInvoiceMetaDataEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(invoiceMetaDataRespository, txHost);
  }
}