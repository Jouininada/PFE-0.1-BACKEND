import { Module } from '@nestjs/common';
import { DefaultConditionService } from './services/default-condition.service';
import { DefaultConditionRepositoryModule } from './repositories/default-condition.repository.module';
import { QuotationModule } from '../quotation/quotation.module';

@Module({
  controllers: [],
  providers: [DefaultConditionService],
  exports: [DefaultConditionService],
  imports: [DefaultConditionRepositoryModule, QuotationModule],
})
export class DefaultConditionModule {}
