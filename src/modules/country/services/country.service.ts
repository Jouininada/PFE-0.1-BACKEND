import { Injectable } from '@nestjs/common';
import { CountryRepository } from '../repositories/repository/country.repository';
import { CountryEntity } from '../repositories/entities/country.entity';
import { CreateCountryDto } from '../dtos/country.create.dto';
import { CountryNotFoundException } from '../errors/country.notfound.error';
import { CountryAlreadyExistsException } from '../errors/country.alreadyexists.error';

@Injectable()
export class CountryService {
  constructor(private readonly countryRepository: CountryRepository) {}

  async findOneById(id: number): Promise<CountryEntity> {
    const country = await this.countryRepository.findOneById(id);
    if (!country) {
      throw new CountryNotFoundException();
    }
    return country;
  }

  async findAll(): Promise<CountryEntity[]> {
    return this.countryRepository.findAll();
  }

  async save(createCountryDto: CreateCountryDto): Promise<CountryEntity> {
    const existingCountry = await this.countryRepository.findByCondition({
      where: { alpha2code: createCountryDto.alpha2code },
    });
    if (existingCountry) {
      throw new CountryAlreadyExistsException();
    }
    return this.countryRepository.save(createCountryDto);
  }

  async saveMany(
    createCountryDto: CreateCountryDto[],
  ): Promise<CountryEntity[]> {
    for (const dto of createCountryDto) {
      const existingCountry = await this.countryRepository.findByCondition({
        where: { alpha2code: dto.alpha2code },
      });
      if (existingCountry) {
        throw new CountryAlreadyExistsException();
      }
    }
    return this.countryRepository.saveMany(createCountryDto);
  }

  async softDelete(id: number): Promise<CountryEntity> {
    const country = await this.countryRepository.softDelete(id);
    if (!country) {
      throw new CountryNotFoundException();
    }
    return country;
  }

  async getTotal(): Promise<number> {
    return this.countryRepository.getTotalCount();
  }

  async deleteAll() {
    return this.countryRepository.deleteAll();
  }
}
