import { Module } from '@nestjs/common';
import { CountryService } from './services/country.service';
import { CountryRepositoryModule } from './repositories/country.repository.module';

@Module({
  controllers: [],
  providers: [CountryService],
  exports: [CountryService],
  imports: [CountryRepositoryModule],
})
export class CountryModule {}
