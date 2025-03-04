import { Module } from '@nestjs/common';
import { ExpensePaymentConditionService } from './services/expense-payment-condition.service';
import { ExpensePaymentConditionRepositoryModule } from './repositories/repository/expense-payment-condition.repository.module';


@Module({
  controllers: [],
  providers: [ExpensePaymentConditionService],
  exports: [ExpensePaymentConditionService],
  imports: [ExpensePaymentConditionRepositoryModule],
})
export class ExpensePaymentConditionModule {}
