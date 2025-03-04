import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensePaymentConditionRepository } from './expense-payment-condition.entity';
import { ExpensePaymentConditionEntity } from '../entity/expense-payment-condition.entity';


@Module({
  controllers: [],
  providers: [ExpensePaymentConditionRepository],
  exports: [ExpensePaymentConditionRepository],
  imports: [TypeOrmModule.forFeature([ExpensePaymentConditionEntity])],
})
export class ExpensePaymentConditionRepositoryModule {}
