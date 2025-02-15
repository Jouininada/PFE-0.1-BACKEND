import { Module } from '@nestjs/common';
import { CountryRepository } from './repository/country.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryEntity } from './entities/country.entity';

@Module({
  controllers: [],
  providers: [CountryRepository],
  exports: [CountryRepository],
  imports: [TypeOrmModule.forFeature([CountryEntity])],
})
export class CountryRepositoryModule {}
