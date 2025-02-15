import { Injectable } from '@nestjs/common';
import { QuotationMetaDataRepository } from '../repositories/repository/quotation-meta-data-repository';
import { QuotationMetaDataEntity } from '../repositories/entities/quotation-meta-data.entity';
import { QuotationMetaDataNotFoundException } from '../errors/quoation-meta-data.notfound.error';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { ResponseQuotationMetaDataDto } from '../dtos/quotation-meta-data.response.dto';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { CreateQuotationMetaDataDto } from '../dtos/quotation-meta-data.create.dto';
import { UpdateQuotationMetaDataDto } from '../dtos/quotation-meta-data.update.dto';

@Injectable()
export class QuotationMetaDataService {
  constructor(
    private readonly quotationMetaDataRepository: QuotationMetaDataRepository,
  ) {}

  async findOneById(id: number): Promise<QuotationMetaDataEntity> {
    const data = await this.quotationMetaDataRepository.findOneById(id);
    if (!data) {
      throw new QuotationMetaDataNotFoundException();
    }
    return data;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseQuotationMetaDataDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const data = await this.quotationMetaDataRepository.findOne(
      queryOptions as FindOneOptions<QuotationMetaDataEntity>,
    );
    if (!data) return null;
    return data;
  }

  async findAll(query: IQueryObject): Promise<ResponseQuotationMetaDataDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.quotationMetaDataRepository.findAll(
      queryOptions as FindManyOptions<QuotationMetaDataEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseQuotationMetaDataDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.quotationMetaDataRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.quotationMetaDataRepository.findAll(
      queryOptions as FindManyOptions<QuotationMetaDataEntity>,
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
    createQuotationMetaDataDto: CreateQuotationMetaDataDto,
  ): Promise<QuotationMetaDataEntity> {
    return this.quotationMetaDataRepository.save(createQuotationMetaDataDto);
  }

  async update(
    id: number,
    updateQuotationMetaDataDto: UpdateQuotationMetaDataDto,
  ): Promise<QuotationMetaDataEntity> {
    const data = await this.findOneById(id);
    return this.quotationMetaDataRepository.save({
      ...data,
      ...updateQuotationMetaDataDto,
    });
  }

  async duplicate(id: number): Promise<QuotationMetaDataEntity> {
    const existingData = await this.findOneById(id);
    const duplicatedData = {
      ...existingData,
      id: undefined,
    };
    return this.quotationMetaDataRepository.save(duplicatedData);
  }

  async softDelete(id: number): Promise<QuotationMetaDataEntity> {
    await this.findOneById(id);
    return this.quotationMetaDataRepository.softDelete(id);
  }

  async deleteAll() {
    return this.quotationMetaDataRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.quotationMetaDataRepository.getTotalCount();
  }
}
