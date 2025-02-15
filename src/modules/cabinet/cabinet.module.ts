import { Module } from '@nestjs/common';
import { CabinetService } from './services/cabinet.service';
import { CabinetRepositoryModule } from './repositories/cabinet.repository.module';
import { AddressModule } from '../address/address.module';
import { CurrencyModule } from '../currency/currency.module';
import { ActivityModule } from '../activity/activity.module';
import { StorageModule } from 'src/common/storage/storage.module';

@Module({
  controllers: [],
  providers: [CabinetService],
  exports: [CabinetService],
  imports: [
    CabinetRepositoryModule,
    ActivityModule,
    AddressModule,
    CurrencyModule,
    StorageModule,
  ],
})
export class CabinetModule {}
