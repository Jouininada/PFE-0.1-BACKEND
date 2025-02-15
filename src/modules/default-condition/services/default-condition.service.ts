import { Injectable } from '@nestjs/common';
import { DefaultConditionRepository } from '../repositories/repository/default-condition.repository';
import { DefaultConditionEntity } from '../repositories/entities/default-condition.entity';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { ResponseDefaultConditionDto } from '../dtos/default-condition.response.dto';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { CreateDefaultConditionDto } from '../dtos/default-condition.create.dto';
import { UpdateDefaultConditionDto } from '../dtos/default-condition.update.dto';
import { QuotationService } from 'src/modules/quotation/services/quotation.service';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class DefaultConditionService {
  constructor(
    private readonly defaultConditionRepository: DefaultConditionRepository,
    private readonly quotationService: QuotationService,
  ) {}

  async findOneById(id: number): Promise<DefaultConditionEntity> {
    const defaultCondition =
      await this.defaultConditionRepository.findOneById(id);
    if (!defaultCondition) {
      throw new DefaultConditionEntity();
    }
    return defaultCondition;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseDefaultConditionDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const defaultCondition = await this.defaultConditionRepository.findOne(
      queryOptions as FindOneOptions<DefaultConditionEntity>,
    );
    if (!defaultCondition) return null;
    return defaultCondition;
  }

  async findAll(query: IQueryObject): Promise<ResponseDefaultConditionDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.defaultConditionRepository.findAll(
      queryOptions as FindManyOptions<DefaultConditionEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseDefaultConditionDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.defaultConditionRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.defaultConditionRepository.findAll(
      queryOptions as FindManyOptions<DefaultConditionEntity>,
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
    createDefaultConditionDto: CreateDefaultConditionDto,
  ): Promise<DefaultConditionEntity> {
    return this.defaultConditionRepository.save(createDefaultConditionDto);
  }

  async update(
    id: number,
    updateDefaultConditionDto: UpdateDefaultConditionDto,
  ): Promise<DefaultConditionEntity> {
    const defaultCondition = await this.findOneById(id);
    return this.defaultConditionRepository.save({
      ...defaultCondition,
      ...updateDefaultConditionDto,
    });
  }

  @Transactional()
  async updateMany(
    updateDefaultConditionDtos: UpdateDefaultConditionDto[],
  ): Promise<DefaultConditionEntity[]> {
    const updatedConditions = await Promise.all(
      updateDefaultConditionDtos.map(async (dto) => {
        const defaultCondition = await this.findOneById(dto.id);
        const newCondition = await this.defaultConditionRepository.save({
          ...defaultCondition,
          ...dto,
        });
        return newCondition;
      }),
    );
    return updatedConditions;
  }

  async softDelete(id: number): Promise<DefaultConditionEntity> {
    await this.findOneById(id);
    return this.defaultConditionRepository.softDelete(id);
  }

  async deleteAll() {
    return this.defaultConditionRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.defaultConditionRepository.getTotalCount();
  }
}
