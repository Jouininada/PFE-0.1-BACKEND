import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxRepository } from './repository/tax.repository';
import { TaxEntity } from './entities/tax.entity';

@Module({
  controllers: [],
  providers: [TaxRepository],
  exports: [TaxRepository],
  imports: [TypeOrmModule.forFeature([TaxEntity])],
})
export class TaxRepositoryModule {}
