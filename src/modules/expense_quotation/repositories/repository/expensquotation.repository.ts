/* eslint-disable prettier/prettier */
import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpensQuotationEntity } from '../entities/expensquotation.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class ExpensequotationRepository extends DatabaseAbstractRepository<ExpensQuotationEntity> {
  constructor(
    @InjectRepository(ExpensQuotationEntity)
    private readonly quotationRepository: Repository<ExpensQuotationEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(quotationRepository, txHost);
  }
}
