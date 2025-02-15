import { Injectable } from '@nestjs/common';
import { TaxRepository } from '../repositories/repository/tax.repository';
import { TaxEntity } from '../repositories/entities/tax.entity';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { CreateTaxDto } from '../dtos/tax.create.dto';
import { UpdateTaxDto } from '../dtos/tax.update.dto';
import { ResponseTaxDto } from '../dtos/tax.response.dto';
import { TaxNotFoundException } from '../errors/tax.notfound.error';
import { TaxAlreadyExistsException } from '../errors/tax.alreadyexists.error';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';

@Injectable()
export class TaxService {
  constructor(private readonly taxRepository: TaxRepository) {}

  async findOneById(id: number): Promise<TaxEntity> {
    const tax = await this.taxRepository.findOneById(id);
    if (!tax) {
      throw new TaxNotFoundException();
    }
    return tax;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseTaxDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const tax = await this.taxRepository.findOne(
      queryOptions as FindOneOptions<TaxEntity>,
    );
    if (!tax) return null;
    return tax;
  }

  async findAll(query: IQueryObject): Promise<ResponseTaxDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.taxRepository.findAll(
      queryOptions as FindManyOptions<TaxEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseTaxDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.taxRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.taxRepository.findAll(
      queryOptions as FindManyOptions<TaxEntity>,
    );

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: {
        page: parseInt(query.page),
        take: parseInt(query.limit),
      },
      itemCount: count,
    });

    return new PageDto(entities, pageMetaDto);
  }

  async save(createTaxDto: CreateTaxDto): Promise<TaxEntity> {
    const tax = await this.taxRepository.findByCondition({
      where: { label: createTaxDto.label },
    });
    if (tax) {
      throw new TaxAlreadyExistsException();
    }
    return this.taxRepository.save(createTaxDto);
  }

  async saveMany(createTaxDtos: CreateTaxDto[]): Promise<TaxEntity[]> {
    return this.taxRepository.saveMany(createTaxDtos);
  }

  async update(id: number, updateTaxDto: UpdateTaxDto): Promise<TaxEntity> {
    const tax = await this.findOneById(id);
    return this.taxRepository.save({
      ...tax,
      ...updateTaxDto,
    });
  }

  async softDelete(id: number): Promise<TaxEntity> {
    await this.findOneById(id);
    return this.taxRepository.softDelete(id);
  }

  async deleteAll(): Promise<void> {
    return this.taxRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.taxRepository.getTotalCount();
  }
}
