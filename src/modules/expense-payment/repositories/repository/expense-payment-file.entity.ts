import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ExpensePaymentEntity } from '../entities/expense-payment.entity';

@Injectable()
export class ExpensePaymentRepository extends DatabaseAbstractRepository<ExpensePaymentEntity> {
  constructor(
    @InjectRepository(ExpensePaymentEntity)
    private readonly expensePaymentRepository: Repository<ExpensePaymentEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(expensePaymentRepository, txHost);
  }
}
