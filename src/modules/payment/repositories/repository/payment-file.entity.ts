import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { PaymentEntity } from '../entities/payment.entity';

@Injectable()
export class PaymentRepository extends DatabaseAbstractRepository<PaymentEntity> {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(paymentRepository, txHost);
  }
}
