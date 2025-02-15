import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { InvoiceMetaDataEntity } from '../entities/invoice-meta-data.entity';

@Injectable()
export class InvoiceMetaDataRepository extends DatabaseAbstractRepository<InvoiceMetaDataEntity> {
  constructor(
    @InjectRepository(InvoiceMetaDataEntity)
    private readonly invoiceMetaDataRespository: Repository<InvoiceMetaDataEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(invoiceMetaDataRespository, txHost);
  }
}
