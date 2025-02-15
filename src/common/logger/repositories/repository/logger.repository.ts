import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { LoggerEntity } from '../entities/logger.entity';

@Injectable()
export class LoggerRepository extends DatabaseAbstractRepository<LoggerEntity> {
  constructor(
    @InjectRepository(LoggerEntity)
    private readonly loggerRepository: Repository<LoggerEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(loggerRepository, txHost);
  }
}
