import { Module } from '@nestjs/common';
import { AddressService } from './services/address.service';
import { AddressRepositoryModule } from './repositories/address.repository.module';
import { CountryModule } from '../country/country.module';

@Module({
  controllers: [],
  providers: [AddressService],
  exports: [AddressService],
  imports: [AddressRepositoryModule, CountryModule],
})
export class AddressModule {}
