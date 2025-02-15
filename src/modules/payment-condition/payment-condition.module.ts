import { Module } from '@nestjs/common';
import { PaymentConditionService } from './services/payment-condition.service';
import { PaymentConditionRepositoryModule } from './repositories/payment-condition.repository.module';

@Module({
  controllers: [],
  providers: [PaymentConditionService],
  exports: [PaymentConditionService],
  imports: [PaymentConditionRepositoryModule],
})
export class PaymentConditionModule {}
