import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FirmEntity } from '../entities/firm.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class FirmRepository extends DatabaseAbstractRepository<FirmEntity> {
  constructor(
    @InjectRepository(FirmEntity)
    private readonly firmRepository: Repository<FirmEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(firmRepository, txHost);
  }
}
