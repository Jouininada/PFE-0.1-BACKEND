import { Module } from '@nestjs/common';
import { TaxService } from './services/tax.service';
import { TaxRepositoryModule } from './repositories/tax.repository.module';

@Module({
  controllers: [],
  providers: [TaxService],
  exports: [TaxService],
  imports: [TaxRepositoryModule],
})
export class TaxModule {}
