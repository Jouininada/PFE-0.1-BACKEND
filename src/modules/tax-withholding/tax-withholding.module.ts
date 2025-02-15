import { Module } from '@nestjs/common';
import { TaxWithholdingService } from './services/tax-withholding.service';
import { TaxWithholdingRepositoryModule } from './repositories/tax-withholding.repository.module';

@Module({
  controllers: [],
  providers: [TaxWithholdingService],
  exports: [TaxWithholdingService],
  imports: [TaxWithholdingRepositoryModule],
})
export class TaxWithholdingModule {}
