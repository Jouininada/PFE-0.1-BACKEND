import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuotationUploadEntity } from '../entities/quotation-file.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class QuotationUploadRepository extends DatabaseAbstractRepository<QuotationUploadEntity> {
  constructor(
    @InjectRepository(QuotationUploadEntity)
    private readonly quotationUploadRespository: Repository<QuotationUploadEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(quotationUploadRespository, txHost);
  }
}
