import { Injectable } from '@nestjs/common';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { UpdatePaymentConditionDto } from '../dtos/payment-condition.update.dto';
import { FindManyOptions, FindOneOptions, Not } from 'typeorm';
import { PaymentConditionEntity } from '../repositories/entity/payment-condition.entity';
import { PaymentConditionRepository } from '../repositories/repository/payment-condition.repository';
import { ResponsePaymentConditionDto } from '../dtos/payment-condition.response.dto';
import { PaymentConditionNotFoundException } from '../errors/payment-condition.notfound.error';
import { CreatePaymentConditionDto } from '../dtos/payment-condition.create.dto';
import { PaymentConditionAlreadyExistsException } from '../errors/payment-condition.alreadyexists.error';
import { PaymentConditionRestrictedDeleteException } from '../errors/payment-condition.restricted-delete.error';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';

@Injectable()
export class PaymentConditionService {
  constructor(
    private readonly paymentConditionRepository: PaymentConditionRepository,
  ) {}

  async findOneById(id: number): Promise<PaymentConditionEntity> {
    const paymentCondition =
      await this.paymentConditionRepository.findOneById(id);
    if (!paymentCondition) {
      throw new PaymentConditionNotFoundException();
    }
    return paymentCondition;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponsePaymentConditionDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const paymentCondition = await this.paymentConditionRepository.findOne(
      queryOptions as FindOneOptions<PaymentConditionEntity>,
    );
    if (!paymentCondition) return null;
    return paymentCondition;
  }

  async findAll(query: IQueryObject): Promise<ResponsePaymentConditionDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.paymentConditionRepository.findAll(
      queryOptions as FindManyOptions<PaymentConditionEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponsePaymentConditionDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.paymentConditionRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.paymentConditionRepository.findAll(
      queryOptions as FindManyOptions<PaymentConditionEntity>,
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
  ): Promise<ResponsePaymentConditionDto | null> {
    const activity = await this.paymentConditionRepository.findByCondition({
      where: { label },
    });
    if (!activity) {
      return null;
    }
    return activity;
  }

  async save(
    createPaymentConditionDto: CreatePaymentConditionDto,
  ): Promise<PaymentConditionEntity> {
    const existingPaymentCondition = await this.findOneByLabel(
      createPaymentConditionDto.label,
    );

    if (existingPaymentCondition) {
      throw new PaymentConditionAlreadyExistsException();
    }
    return this.paymentConditionRepository.save(createPaymentConditionDto);
  }

  async saveMany(
    createCountryDto: CreatePaymentConditionDto[],
  ): Promise<PaymentConditionEntity[]> {
    for (const dto of createCountryDto) {
      const existingPaymentCondition = await this.findOneByLabel(dto.label);
      if (existingPaymentCondition) {
        throw new PaymentConditionAlreadyExistsException();
      }
    }
    return this.paymentConditionRepository.saveMany(createCountryDto);
  }

  async update(
    id: number,
    updatePaymentConditionDto: UpdatePaymentConditionDto,
  ): Promise<PaymentConditionEntity> {
    const existingPaymentCondition =
      await this.paymentConditionRepository.findByCondition({
        where: {
          label: updatePaymentConditionDto.label,
          id: Not(id),
        },
      });
    if (existingPaymentCondition) {
      throw new PaymentConditionAlreadyExistsException();
    }
    return this.paymentConditionRepository.save({
      ...existingPaymentCondition,
      ...updatePaymentConditionDto,
    });
  }

  async softDelete(id: number): Promise<PaymentConditionEntity> {
    const paymentCondition =
      await this.paymentConditionRepository.findOneById(id);
    if (paymentCondition.isDeletionRestricted) {
      throw new PaymentConditionRestrictedDeleteException();
    }
    const deletedPaymentCondition =
      await this.paymentConditionRepository.softDelete(id);
    if (!deletedPaymentCondition) {
      throw new PaymentConditionNotFoundException();
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
