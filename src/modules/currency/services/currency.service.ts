import { Injectable } from '@nestjs/common';
import { CurrencyRepository } from '../repositories/repository/currency.repository';
import { CurrencyEntity } from '../repositories/entities/currency.entity';
import { CreateCurrencyDto } from '../dtos/currency.create.dto';
import { CurrencyNotFoundException } from '../errors/currency.notfound.error';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CurrencyService {
  constructor(
    private readonly currencyRepository: CurrencyRepository,
    private readonly configService: ConfigService,
  ) {}

  async findOneById(id: number): Promise<CurrencyEntity> {
    const currency = await this.currencyRepository.findOneById(id);
    if (!currency) {
      throw new CurrencyNotFoundException();
    }
    return currency;
  }
  async findAll(): Promise<CurrencyEntity[]> {
    const currencies = await this.currencyRepository.findAll();

    // Get favorite currencies from config
    const favCurrencies = this.configService.get<Record<string, string>>(
      'app-preferences.currency',
    );
    const favoriteCurrencyCodes = Object.values(favCurrencies).filter(Boolean);

    // Create a map for quick look-up of favorite currency codes
    const favoriteCurrencyMap = new Set(favoriteCurrencyCodes);

    // Sort currencies: favorites first, then the rest
    const reorderedCurrencies = currencies.sort((a, b) => {
      const isAFavorite = favoriteCurrencyMap.has(a.code);
      const isBFavorite = favoriteCurrencyMap.has(b.code);

      if (isAFavorite && !isBFavorite) return -1; // a is a favorite, b is not
      if (!isAFavorite && isBFavorite) return 1; // b is a favorite, a is not
      return 0; // Both are favorites or neither are favorites, maintain original order
    });

    return reorderedCurrencies;
  }

  async save(createCurrencyDto: CreateCurrencyDto): Promise<CurrencyEntity> {
    return this.currencyRepository.save(createCurrencyDto);
  }

  async saveMany(
    createCurrencyDtos: CreateCurrencyDto[],
  ): Promise<CurrencyEntity[]> {
    return this.currencyRepository.saveMany(createCurrencyDtos);
  }

  async softDelete(id: number): Promise<CurrencyEntity> {
    await this.findOneById(id);
    return this.currencyRepository.softDelete(id);
  }

  async getTotal(): Promise<number> {
    return this.currencyRepository.getTotalCount();
  }

  async deleteAll() {
    return this.currencyRepository.deleteAll();
  }
}
