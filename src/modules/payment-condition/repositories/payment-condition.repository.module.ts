import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentConditionRepository } from './repository/payment-condition.repository';
import { PaymentConditionEntity } from './entity/payment-condition.entity';

@Module({
  controllers: [],
  providers: [PaymentConditionRepository],
  exports: [PaymentConditionRepository],
  imports: [TypeOrmModule.forFeature([PaymentConditionEntity])],
})
export class PaymentConditionRepositoryModule {}
