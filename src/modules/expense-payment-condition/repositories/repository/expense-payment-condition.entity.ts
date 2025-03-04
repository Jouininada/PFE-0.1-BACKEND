import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ExpensePaymentConditionEntity } from '../entity/expense-payment-condition.entity';

@Injectable()
export class ExpensePaymentConditionRepository extends DatabaseAbstractRepository<ExpensePaymentConditionEntity> {
  constructor(
    @InjectRepository(ExpensePaymentConditionEntity)
    private readonly paymentConditionRepository: Repository<ExpensePaymentConditionEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(paymentConditionRepository, txHost);
  }
}
