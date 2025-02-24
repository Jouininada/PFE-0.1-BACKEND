import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ExpensePaymentUploadEntity } from '../entities/expense-payment-file.entity';

@Injectable()
export class ExpensePaymentUploadRepository extends DatabaseAbstractRepository<ExpensePaymentUploadEntity> {
  constructor(
    @InjectRepository(ExpensePaymentUploadEntity)
    private readonly ExpensePaymentUploadRepository: Repository<ExpensePaymentUploadEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(ExpensePaymentUploadRepository, txHost);
  }
}
