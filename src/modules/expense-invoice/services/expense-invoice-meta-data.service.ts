import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { ExpenseInvoiceMetaDataRepository } from '../repositories/repository/expense-invoice-meta-data.repository';
import { ExpenseInvoiceMetaDataEntity } from '../repositories/entities/expense-invoice-meta-data.entity';
import { ExpenseResponseInvoiceMetaDataDto } from '../dtos/expense-invoice-meta-data.response.dto';
import { ExpenseCreateInvoiceMetaDataDto } from '../dtos/expense-invoice-meta-data.create.dtos';
import { ExpenseUpdateInvoiceMetaDataDto } from '../dtos/expense-invoice-meta-data.update.dto';
import { ExpenseInvoiceMetaDataNotFoundException } from '../errors/expense-invoice-meta-data.notfound.error';


@Injectable()
export class ExpenseInvoiceMetaDataService {
  constructor(
    private readonly invoiceMetaDataRepository: ExpenseInvoiceMetaDataRepository,
  ) {}

  async findOneById(id: number): Promise<ExpenseInvoiceMetaDataEntity> {
    const data = await this.invoiceMetaDataRepository.findOneById(id);
    if (!data) {
      throw new ExpenseInvoiceMetaDataNotFoundException();
    }
    return data;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ExpenseResponseInvoiceMetaDataDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const data = await this.invoiceMetaDataRepository.findOne(
      queryOptions as FindOneOptions<ExpenseInvoiceMetaDataEntity>,
    );
    if (!data) return null;
    return data;
  }

  async findAll(query: IQueryObject): Promise<ExpenseResponseInvoiceMetaDataDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.invoiceMetaDataRepository.findAll(
      queryOptions as FindManyOptions<ExpenseInvoiceMetaDataEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ExpenseResponseInvoiceMetaDataDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.invoiceMetaDataRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.invoiceMetaDataRepository.findAll(
      queryOptions as FindManyOptions<ExpenseInvoiceMetaDataEntity>,
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
    createInvoiceMetaDataDto: ExpenseCreateInvoiceMetaDataDto,
  ): Promise<ExpenseInvoiceMetaDataEntity> {
    return this.invoiceMetaDataRepository.save(createInvoiceMetaDataDto);
  }

  async update(
    id: number,
    updateInvoiceMetaDataDto: ExpenseUpdateInvoiceMetaDataDto,
  ): Promise<ExpenseInvoiceMetaDataEntity> {
    const data = await this.findOneById(id);
    return this.invoiceMetaDataRepository.save({
      ...data,
      ...updateInvoiceMetaDataDto,
    });
  }

  async duplicate(id: number): Promise<ExpenseInvoiceMetaDataEntity> {
    const existingData = await this.findOneById(id);
    const duplicatedData = {
      ...existingData,
      id: undefined,
    };
    return this.invoiceMetaDataRepository.save(duplicatedData);
  }

  async softDelete(id: number): Promise<ExpenseInvoiceMetaDataEntity> {
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
