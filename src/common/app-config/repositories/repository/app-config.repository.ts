import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppConfigEntity } from '../entities/app-config.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class AppConfigRepository extends DatabaseAbstractRepository<AppConfigEntity> {
  constructor(
    @InjectRepository(AppConfigEntity)
    private readonly appConfigRepository: Repository<AppConfigEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(appConfigRepository, txHost);
  }
}
