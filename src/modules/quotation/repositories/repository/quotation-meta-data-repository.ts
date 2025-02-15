import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuotationMetaDataEntity } from '../entities/quotation-meta-data.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class QuotationMetaDataRepository extends DatabaseAbstractRepository<QuotationMetaDataEntity> {
  constructor(
    @InjectRepository(QuotationMetaDataEntity)
    private readonly quotationMetaDataRespository: Repository<QuotationMetaDataEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(quotationMetaDataRespository, txHost);
  }
}
