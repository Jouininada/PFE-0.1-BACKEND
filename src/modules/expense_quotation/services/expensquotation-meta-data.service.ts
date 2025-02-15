/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ExpensQuotationMetaDataEntity } from '../repositories/entities/expensquotation-meta-data.entity';
import { QuotationMetaDataNotFoundException } from '../errors/quoation-meta-data.notfound.error';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { ExpensequotationRepository } from '../repositories/repository/expensquotation.repository';
import { ExpenseQuotationMetaDataRepository } from '../repositories/repository/expensquotation-meta-data-repository';
import { ResponseExpensQuotationMetaDataDto } from '../dtos/expensquotation-meta-data.response.dto';
import { CreateExpensQuotationMetaDataDto } from '../dtos/expensquotation-meta-data.create.dto';
import { UpdateExpensQuotationMetaDataDto } from '../dtos/expensquotation-meta-data.update.dto';

@Injectable()
export class ExpensQuotationMetaDataService {

    constructor(
        private readonly quotationMetaDataRepository: ExpenseQuotationMetaDataRepository,
      ) {}

      
      async findOneById(id: number): Promise<ExpensQuotationMetaDataEntity> {
        const data = await this.quotationMetaDataRepository.findOneById(id);
        if (!data) {
          throw new QuotationMetaDataNotFoundException();
        }
        return data;
      }

      async findOneByCondition(
        query: IQueryObject,
      ): Promise<ResponseExpensQuotationMetaDataDto | null> {
        const queryBuilder = new QueryBuilder();
        const queryOptions = queryBuilder.build(query);
        const data = await this.quotationMetaDataRepository.findOne(
          queryOptions as FindOneOptions<ExpensQuotationMetaDataEntity>,
        );
        if (!data) return null;
        return data;
      }

      async findAll(query: IQueryObject): Promise<ResponseExpensQuotationMetaDataDto[]> {
        const queryBuilder = new QueryBuilder();
        const queryOptions = queryBuilder.build(query);
        return await this.quotationMetaDataRepository.findAll(
          queryOptions as FindManyOptions<ExpensQuotationMetaDataEntity>,
        );
      }

      
      async findAllPaginated(
        query: IQueryObject,
      ): Promise<PageDto<ResponseExpensQuotationMetaDataDto>> {
        const queryBuilder = new QueryBuilder();
        const queryOptions = queryBuilder.build(query);
        const count = await this.quotationMetaDataRepository.getTotalCount({
          where: queryOptions.where,
        });
    
        const entities = await this.quotationMetaDataRepository.findAll(
          queryOptions as FindManyOptions<ExpensQuotationMetaDataEntity>,
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
        createQuotationMetaDataDto: CreateExpensQuotationMetaDataDto,
      ): Promise<ExpensQuotationMetaDataEntity> {
        return this.quotationMetaDataRepository.save(createQuotationMetaDataDto);
      }

      async update(
        id: number,
        updateQuotationMetaDataDto: UpdateExpensQuotationMetaDataDto,
      ): Promise<ExpensQuotationMetaDataEntity> {
        const data = await this.findOneById(id);
        return this.quotationMetaDataRepository.save({
          ...data,
          ...updateQuotationMetaDataDto,
        });
      }

      async duplicate(id: number): Promise<ExpensQuotationMetaDataEntity> {
        const existingData = await this.findOneById(id);
        const duplicatedData = {
          ...existingData,
          id: undefined,
        };
        return this.quotationMetaDataRepository.save(duplicatedData);
      }

      
      async softDelete(id: number): Promise<ExpensQuotationMetaDataEntity> {
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
