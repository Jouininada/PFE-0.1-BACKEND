import { Module } from '@nestjs/common';
import { BankAccountService } from './services/bank-account.service';
import { BankAccountRepositoryModule } from './repositories/bank-account.repository.module';

@Module({
  controllers: [],
  providers: [BankAccountService],
  exports: [BankAccountService],
  imports: [BankAccountRepositoryModule],
})
export class BankAccountModule {}
