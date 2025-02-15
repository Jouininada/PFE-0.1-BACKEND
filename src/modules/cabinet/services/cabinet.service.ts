import { Injectable } from '@nestjs/common';
import { CabinetRepository } from '../repositories/repository/cabinet.repository';
import { CreateCabinetDto } from '../dtos/cabinet.create.dto';
import { CabinetEntity } from '../repositories/entities/cabinet.entity';
import { AddressService } from 'src/modules/address/services/address.service';
import {
  EnterpriseNameAlreadyExistsException,
  TaxIdNumberDuplicateException,
} from '../errors/cabinet.alreadyexists.error';
import { CabinetNotFoundException } from '../errors/cabinet.notfound.error';
import { UpdateCabinetDto } from '../dtos/cabinet.update.dto';
import { CurrencyService } from 'src/modules/currency/services/currency.service';
import { ActivityService } from 'src/modules/activity/services/activity.service';
import { StorageService } from 'src/common/storage/services/storage.service';

@Injectable()
export class CabinetService {
  constructor(
    private readonly cabinetRepository: CabinetRepository,
    private readonly addressService: AddressService,
    private readonly currencyService: CurrencyService,
    private readonly activityService: ActivityService,
    private readonly storageService: StorageService,
  ) {}

  async findOneById(id: number): Promise<CabinetEntity> {
    const cabinet = await (
      await this.cabinetRepository.createQueryBuilder('cabinet')
    )
      .leftJoinAndSelect('cabinet.address', 'address')
      .leftJoinAndSelect('cabinet.currency', 'currency')
      .leftJoinAndSelect('cabinet.activity', 'activity')
      .leftJoinAndSelect('address.country', 'country')
      .where('cabinet.id = :id', { id })
      .getOne();

    if (!cabinet) {
      throw new CabinetNotFoundException();
    }
    return cabinet;
  }
  async findAll(): Promise<CabinetEntity[]> {
    return this.cabinetRepository.findAll();
  }

  async save(createCabinetDto: CreateCabinetDto): Promise<CabinetEntity> {
    await this.activityService.findOneById(createCabinetDto.activityId);
    await this.currencyService.findOneById(createCabinetDto.currencyId);

    const existingCabinetByName = await this.cabinetRepository.findByCondition({
      where: { enterpriseName: createCabinetDto.enterpriseName },
    });

    if (existingCabinetByName) {
      throw new EnterpriseNameAlreadyExistsException();
    }

    const existingCabinetByTaxId = await this.cabinetRepository.findByCondition(
      {
        where: { taxIdNumber: createCabinetDto.taxIdNumber },
      },
    );
    if (existingCabinetByTaxId) {
      throw new TaxIdNumberDuplicateException();
    }

    const address = await this.addressService.save(createCabinetDto.address);

    return this.cabinetRepository.save({
      ...createCabinetDto,
      addressId: address.id,
    });
  }

  async update(
    id: number,
    updateCabinetDto: UpdateCabinetDto,
  ): Promise<CabinetEntity> {
    const cabinet = await this.findOneById(id);
    this.storageService.delete(cabinet.logoId);
    this.storageService.delete(cabinet.signatureId);

    let address = await this.addressService.findOneById(cabinet.addressId);
    const activity = await this.activityService.findOneById(
      updateCabinetDto.activityId,
    );
    const currency = await this.currencyService.findOneById(
      updateCabinetDto.currencyId,
    );

    address = await this.addressService.update(cabinet.addressId, {
      ...address,
      ...updateCabinetDto.address,
    });

    return this.cabinetRepository.save({
      ...cabinet,
      ...updateCabinetDto,
      address,
      currency,
      activity,
    });
  }

  async softDelete(id: number): Promise<CabinetEntity> {
    await this.findOneById(id);
    return this.cabinetRepository.softDelete(id);
  }

  async deleteAll() {
    this.cabinetRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.cabinetRepository.getTotalCount();
  }
}
