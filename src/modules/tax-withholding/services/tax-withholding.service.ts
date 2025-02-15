import { Injectable } from '@nestjs/common';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { TaxWithholdingRepository } from '../repositories/repository/tax-withholding.repository';
import { TaxWithholdingEntity } from '../repositories/entities/tax-withholding.entity';
import { TaxWithholdingNotFoundException } from '../errors/tax-withholding.notfound.error';
import { ResponseTaxWithholdingDto } from '../dtos/tax-withholding.response.dto';
import { CreateTaxWithholdingDto } from '../dtos/tax-withholding.create.dto';
import { TaxWithholdingAlreadyExistsException } from '../errors/tax-withholding.alreadyexists.error';
import { UpdateTaxWithholdingDto } from '../dtos/tax-withholding.update.dto';

@Injectable()
export class TaxWithholdingService {
  constructor(
    private readonly taxWithholdingRepository: TaxWithholdingRepository,
  ) {}

  async findOneById(id: number): Promise<TaxWithholdingEntity> {
    const tax = await this.taxWithholdingRepository.findOneById(id);
    if (!tax) {
      throw new TaxWithholdingNotFoundException();
    }
    return tax;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseTaxWithholdingDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const tax = await this.taxWithholdingRepository.findOne(
      queryOptions as FindOneOptions<TaxWithholdingEntity>,
    );
    if (!tax) return null;
    return tax;
  }

  async findAll(query: IQueryObject): Promise<ResponseTaxWithholdingDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.taxWithholdingRepository.findAll(
      queryOptions as FindManyOptions<TaxWithholdingEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseTaxWithholdingDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.taxWithholdingRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.taxWithholdingRepository.findAll(
      queryOptions as FindManyOptions<TaxWithholdingEntity>,
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

  async save(
    createTaxWithholdingDto: CreateTaxWithholdingDto,
  ): Promise<TaxWithholdingEntity> {
    const tax = await this.taxWithholdingRepository.findByCondition({
      where: { label: createTaxWithholdingDto.label },
    });
    if (tax) {
      throw new TaxWithholdingAlreadyExistsException();
    }
    return this.taxWithholdingRepository.save(createTaxWithholdingDto);
  }

  async saveMany(
    createTaxWithholdingDtos: CreateTaxWithholdingDto[],
  ): Promise<TaxWithholdingEntity[]> {
    return this.taxWithholdingRepository.saveMany(createTaxWithholdingDtos);
  }

  async update(
    id: number,
    updateTaxWithholdingDto: UpdateTaxWithholdingDto,
  ): Promise<TaxWithholdingEntity> {
    const tax = await this.findOneById(id);
    return this.taxWithholdingRepository.save({
      ...tax,
      ...updateTaxWithholdingDto,
    });
  }

  async softDelete(id: number): Promise<TaxWithholdingEntity> {
    await this.findOneById(id);
    return this.taxWithholdingRepository.softDelete(id);
  }

  async deleteAll(): Promise<void> {
    return this.taxWithholdingRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.taxWithholdingRepository.getTotalCount();
  }
}
