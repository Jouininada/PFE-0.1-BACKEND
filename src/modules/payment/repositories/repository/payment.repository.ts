import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { PaymentUploadEntity } from '../entities/payment-file.entity';

@Injectable()
export class PaymentUploadRepository extends DatabaseAbstractRepository<PaymentUploadEntity> {
  constructor(
    @InjectRepository(PaymentUploadEntity)
    private readonly paymentUploadRepository: Repository<PaymentUploadEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(paymentUploadRepository, txHost);
  }
}
