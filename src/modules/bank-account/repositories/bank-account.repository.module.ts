import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountEntity } from './entities/bank-account.entity';
import { BankAccountRepository } from './repository/bank-account.repository';

@Module({
  controllers: [],
  providers: [BankAccountRepository],
  exports: [BankAccountRepository],
  imports: [TypeOrmModule.forFeature([BankAccountEntity])],
})
export class BankAccountRepositoryModule {}
