import { Module } from '@nestjs/common';
import { FirmService } from './services/firm.service';
import { FirmRepositoryModule } from './repositories/firm.repository.module';
import { InterlocutorModule } from '../interlocutor/Interlocutor.module';
import { AddressModule } from '../address/address.module';
import { CurrencyModule } from '../currency/currency.module';
import { ActivityModule } from '../activity/activity.module';
import { PaymentConditionModule } from '../payment-condition/payment-condition.module';
import { FirmInterlocutorEntryModule } from '../firm-interlocutor-entry/firm-interlocutor-entry.module';

@Module({
  controllers: [],
  providers: [FirmService],
  exports: [FirmService],
  imports: [
    FirmRepositoryModule,
    ActivityModule,
    AddressModule,
    CurrencyModule,
    InterlocutorModule,
    PaymentConditionModule,
    FirmInterlocutorEntryModule,
  ],
})
export class FirmModule {}
