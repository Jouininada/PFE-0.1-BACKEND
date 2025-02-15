/* eslint-disable prettier/prettier */
import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpensQuotationUploadEntity } from '../entities/expensquotation-file.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class ExpensQuotationUploadRepository extends DatabaseAbstractRepository<ExpensQuotationUploadEntity> { 
  constructor(
    @InjectRepository(ExpensQuotationUploadEntity)
    private readonly quotationUploadRepository: Repository<ExpensQuotationUploadEntity>,  // Correction du nom
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(quotationUploadRepository, txHost);  // Utilisation du nom corrigé
  }
}
