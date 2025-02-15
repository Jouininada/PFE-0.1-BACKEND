import { Module } from '@nestjs/common';
import { CurrencyService } from './services/currency.service';
import { CurrencyRepositoryModule } from './repositories/currency.repository.module';

@Module({
  controllers: [],
  providers: [CurrencyService],
  exports: [CurrencyService],
  imports: [CurrencyRepositoryModule],
})
export class CurrencyModule {}
