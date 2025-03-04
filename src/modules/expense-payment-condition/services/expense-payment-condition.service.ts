import { Injectable } from '@nestjs/common';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { FindManyOptions, FindOneOptions, Not } from 'typeorm';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { ExpensePaymentConditionRepository } from '../repositories/repository/expense-payment-condition.entity';
import { ExpensePaymentConditionEntity } from '../repositories/entity/expense-payment-condition.entity';
import { ExpensePaymentConditionNotFoundException } from '../errors/expense-payment-condition.notfound.error';
import { ExpenseResponsePaymentConditionDto } from '../dtos/expense-payment-condition.response.dto';
import { ExpenseCreatePaymentConditionDto } from '../dtos/expense-payment-condition.create.dto';
import { ExpensePaymentConditionAlreadyExistsException } from '../errors/expense-payment-condition.alreadyexists.error';
import { ExpenseUpdatePaymentConditionDto } from '../dtos/expense-payment-condition.update.dto';
import { ExpensePaymentConditionRestrictedDeleteException } from '../errors/expense-payment-condition.restricted-delete.error';

@Injectable()
export class ExpensePaymentConditionService {
  constructor(
    private readonly paymentConditionRepository: ExpensePaymentConditionRepository,
  ) {}

  async findOneById(id: number): Promise<ExpensePaymentConditionEntity> {
    const paymentCondition =
      await this.paymentConditionRepository.findOneById(id);
    if (!paymentCondition) {
      throw new ExpensePaymentConditionNotFoundException();
    }
    return paymentCondition;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ExpenseResponsePaymentConditionDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const paymentCondition = await this.paymentConditionRepository.findOne(
      queryOptions as FindOneOptions<ExpensePaymentConditionEntity>,
    );
    if (!paymentCondition) return null;
    return paymentCondition;
  }

  async findAll(query: IQueryObject): Promise<ExpenseResponsePaymentConditionDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.paymentConditionRepository.findAll(
      queryOptions as FindManyOptions<ExpensePaymentConditionEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ExpenseResponsePaymentConditionDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.paymentConditionRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.paymentConditionRepository.findAll(
      queryOptions as FindManyOptions<ExpensePaymentConditionEntity>,
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

  async findOneByLabel(
    label: string,
  ): Promise<ExpenseResponsePaymentConditionDto | null> {
    const activity = await this.paymentConditionRepository.findByCondition({
      where: { label },
    });
    if (!activity) {
      return null;
    }
    return activity;
  }

  async save(
    createPaymentConditionDto: ExpenseCreatePaymentConditionDto,
  ): Promise<ExpensePaymentConditionEntity> {
    const existingPaymentCondition = await this.findOneByLabel(
      createPaymentConditionDto.label,
    );

    if (existingPaymentCondition) {
      throw new ExpensePaymentConditionAlreadyExistsException();
    }
    return this.paymentConditionRepository.save(createPaymentConditionDto);
  }

  async saveMany(
    createCountryDto: ExpenseCreatePaymentConditionDto[],
  ): Promise<ExpensePaymentConditionEntity[]> {
    for (const dto of createCountryDto) {
      const existingPaymentCondition = await this.findOneByLabel(dto.label);
      if (existingPaymentCondition) {
        throw new ExpensePaymentConditionAlreadyExistsException();
      }
    }
    return this.paymentConditionRepository.saveMany(createCountryDto);
  }

  async update(
    id: number,
    updatePaymentConditionDto: ExpenseUpdatePaymentConditionDto,
  ): Promise<ExpensePaymentConditionEntity> {
    const existingPaymentCondition =
      await this.paymentConditionRepository.findByCondition({
        where: {
          label: updatePaymentConditionDto.label,
          id: Not(id),
        },
      });
    if (existingPaymentCondition) {
      throw new ExpensePaymentConditionAlreadyExistsException();
    }
    return this.paymentConditionRepository.save({
      ...existingPaymentCondition,
      ...updatePaymentConditionDto,
    });
  }

  async softDelete(id: number): Promise<ExpensePaymentConditionEntity> {
    const paymentCondition =
      await this.paymentConditionRepository.findOneById(id);
    if (paymentCondition.isDeletionRestricted) {
      throw new ExpensePaymentConditionRestrictedDeleteException();
    }
    const deletedPaymentCondition =
      await this.paymentConditionRepository.softDelete(id);
    if (!deletedPaymentCondition) {
      throw new ExpensePaymentConditionNotFoundException();
    }
    return deletedPaymentCondition;
  }

  async getTotal(): Promise<number> {
    return this.paymentConditionRepository.getTotalCount();
  }

  async deleteAll() {
    return this.paymentConditionRepository.deleteAll();
  }
}
