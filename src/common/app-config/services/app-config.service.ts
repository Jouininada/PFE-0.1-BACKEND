import { Injectable } from '@nestjs/common';
import { AppConfigRepository } from '../repositories/repository/app-config.repository';
import { AppConfigEntity } from '../repositories/entities/app-config.entity';
import { AppConfigNotFoundException } from '../errors/app-config.notfound.error';
import { ResponseAppConfigDto } from '../dtos/app-config.response';
import { CreateAppConfigDto } from '../dtos/app-config.create.dto';
import { AppConfigAlreadyExistsException } from '../errors/app-config.alreadyexists.error';
import { UpdateAppConfigDto } from '../dtos/app-config.update.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions } from 'typeorm';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';

@Injectable()
export class AppConfigService {
  constructor(private readonly appConfigRepository: AppConfigRepository) {}

  async findOneById(id: number): Promise<AppConfigEntity> {
    const config = await this.appConfigRepository.findOneById(id);
    if (!config) {
      throw new AppConfigNotFoundException();
    }
    return config;
  }

  async findAll(query: IQueryObject): Promise<ResponseAppConfigDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.appConfigRepository.findAll(
      queryOptions as FindManyOptions<AppConfigEntity>,
    );
  }

  async findOneByName(key: string): Promise<AppConfigEntity | null> {
    const config = await this.appConfigRepository.findByCondition({
      where: { key },
    });
    if (!config) {
      return null;
    }
    return config;
  }

  async save(createAppConfigDto: CreateAppConfigDto): Promise<AppConfigEntity> {
    const config = await this.findOneByName(createAppConfigDto.key);
    if (config) {
      throw new AppConfigAlreadyExistsException();
    }
    return this.appConfigRepository.save(createAppConfigDto);
  }

  async saveMany(
    createAppConfigDtos: CreateAppConfigDto[],
  ): Promise<AppConfigEntity[]> {
    for (const config of createAppConfigDtos) {
      const existingConfig = await this.findOneByName(config.key);
      if (existingConfig) {
        throw new AppConfigAlreadyExistsException();
      }
    }
    return this.appConfigRepository.saveMany(createAppConfigDtos);
  }

  async update(
    id: number,
    updateAppConfigDto: UpdateAppConfigDto,
  ): Promise<AppConfigEntity> {
    const config = await this.findOneById(id);
    return this.appConfigRepository.save({
      ...config,
      ...updateAppConfigDto,
    });
  }

  async softDelete(id: number): Promise<AppConfigEntity> {
    await this.findOneById(id);
    return this.appConfigRepository.softDelete(id);
  }

  async deleteManyByName(names: string[]): Promise<void> {
    for (const name of names) {
      const config = await this.findOneByName(name);
      if (config) {
        this.softDelete(config.id);
      }
    }
  }

  async deleteAll() {
    return this.appConfigRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.appConfigRepository.getTotalCount();
  }
}
