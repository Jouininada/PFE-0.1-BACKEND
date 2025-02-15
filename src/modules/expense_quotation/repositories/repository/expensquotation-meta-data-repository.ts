/* eslint-disable prettier/prettier */
import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpensQuotationMetaDataEntity } from '../entities/expensquotation-meta-data.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class ExpenseQuotationMetaDataRepository extends DatabaseAbstractRepository<ExpensQuotationMetaDataEntity> {
  constructor(
    @InjectRepository(ExpensQuotationMetaDataEntity)
    private readonly expenseQuotationMetaDataRepository: Repository<ExpensQuotationMetaDataEntity>,  // Correction du nom pour correspondre à l'entité

    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(expenseQuotationMetaDataRepository, txHost);  // Utilisation de la variable corrigée
  }
}
