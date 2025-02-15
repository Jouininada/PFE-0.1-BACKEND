import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyRepository } from './repository/currency.repository';
import { CurrencyEntity } from './entities/currency.entity';

@Module({
  controllers: [],
  providers: [CurrencyRepository],
  exports: [CurrencyRepository],
  imports: [TypeOrmModule.forFeature([CurrencyEntity])],
})
export class CurrencyRepositoryModule {}
