import { Injectable } from '@nestjs/common';
import { AddressRepository } from '../repositories/repository/address.repository';
import { AddressEntity } from '../repositories/entities/address.entity';
import { CreateAddressDto } from '../dtos/address.create.dto';
import { UpdateAddressDto } from '../dtos/address.update.dto';
import { CountryService } from 'src/modules/country/services/country.service';
import { AddressNotFoundException } from '../errors/address.notfound.error';

@Injectable()
export class AddressService {
  constructor(
    private readonly addressRepository: AddressRepository,
    private countryService: CountryService,
  ) {}

  async findOneById(id: number): Promise<AddressEntity> {
    const address = await this.addressRepository.findOneById(id);
    if (!address) {
      throw new AddressNotFoundException();
    }
    return address;
  }

  async save(createActivityDto: CreateAddressDto): Promise<AddressEntity> {
    await this.countryService.findOneById(createActivityDto.countryId);
    return this.addressRepository.save(createActivityDto);
  }

  async update(
    id: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<AddressEntity> {
    const country = await this.countryService.findOneById(
      updateAddressDto.countryId,
    );
    const address = await this.findOneById(id);
    return this.addressRepository.save({
      ...address,
      ...updateAddressDto,
      country,
    });
  }

  async softDelete(id: number): Promise<AddressEntity> {
    await this.findOneById(id);
    return this.addressRepository.softDelete(id);
  }
}
