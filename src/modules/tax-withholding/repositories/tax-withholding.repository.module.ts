import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxWithholdingEntity } from './entities/tax-withholding.entity';
import { TaxWithholdingRepository } from './repository/tax-withholding.repository';

@Module({
  controllers: [],
  providers: [TaxWithholdingRepository],
  exports: [TaxWithholdingRepository],
  imports: [TypeOrmModule.forFeature([TaxWithholdingEntity])],
})
export class TaxWithholdingRepositoryModule {}
