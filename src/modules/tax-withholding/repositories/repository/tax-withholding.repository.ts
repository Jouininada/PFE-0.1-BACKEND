import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { TaxWithholdingEntity } from '../entities/tax-withholding.entity';

@Injectable()
export class TaxWithholdingRepository extends DatabaseAbstractRepository<TaxWithholdingEntity> {
  constructor(
    @InjectRepository(TaxWithholdingEntity)
    private readonly taxWithholdingRepository: Repository<TaxWithholdingEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(taxWithholdingRepository, txHost);
  }
}
