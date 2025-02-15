import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { InvoiceMetaDataRepository } from '../repositories/repository/invoice-meta-data.repository';
import { InvoiceMetaDataEntity } from '../repositories/entities/invoice-meta-data.entity';
import { InvoiceMetaDataNotFoundException } from '../errors/invoice-meta-data.notfound.error';
import { ResponseInvoiceMetaDataDto } from '../dtos/invoice-meta-data.response.dto';
import { CreateInvoiceMetaDataDto } from '../dtos/invoice-meta-data.create.dto';
import { UpdateInvoiceMetaDataDto } from '../dtos/invoice-meta-data.update.dto';

@Injectable()
export class InvoiceMetaDataService {
  constructor(
    private readonly invoiceMetaDataRepository: InvoiceMetaDataRepository,
  ) {}

  async findOneById(id: number): Promise<InvoiceMetaDataEntity> {
    const data = await this.invoiceMetaDataRepository.findOneById(id);
    if (!data) {
      throw new InvoiceMetaDataNotFoundException();
    }
    return data;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseInvoiceMetaDataDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const data = await this.invoiceMetaDataRepository.findOne(
      queryOptions as FindOneOptions<InvoiceMetaDataEntity>,
    );
    if (!data) return null;
    return data;
  }

  async findAll(query: IQueryObject): Promise<ResponseInvoiceMetaDataDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.invoiceMetaDataRepository.findAll(
      queryOptions as FindManyOptions<InvoiceMetaDataEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseInvoiceMetaDataDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.invoiceMetaDataRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.invoiceMetaDataRepository.findAll(
      queryOptions as FindManyOptions<InvoiceMetaDataEntity>,
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
    createInvoiceMetaDataDto: CreateInvoiceMetaDataDto,
  ): Promise<InvoiceMetaDataEntity> {
    return this.invoiceMetaDataRepository.save(createInvoiceMetaDataDto);
  }

  async update(
    id: number,
    updateInvoiceMetaDataDto: UpdateInvoiceMetaDataDto,
  ): Promise<InvoiceMetaDataEntity> {
    const data = await this.findOneById(id);
    return this.invoiceMetaDataRepository.save({
      ...data,
      ...updateInvoiceMetaDataDto,
    });
  }

  async duplicate(id: number): Promise<InvoiceMetaDataEntity> {
    const existingData = await this.findOneById(id);
    const duplicatedData = {
      ...existingData,
      id: undefined,
    };
    return this.invoiceMetaDataRepository.save(duplicatedData);
  }

  async softDelete(id: number): Promise<InvoiceMetaDataEntity> {
    await this.findOneById(id);
    return this.invoiceMetaDataRepository.softDelete(id);
  }

  async deleteAll() {
    return this.invoiceMetaDataRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.invoiceMetaDataRepository.getTotalCount();
  }
}
