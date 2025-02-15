import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MigrationEntity } from '../entities/migration.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class MigrationRepository extends DatabaseAbstractRepository<MigrationEntity> {
  constructor(
    @InjectRepository(MigrationEntity)
    private readonly migrationRepository: Repository<MigrationEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(migrationRepository, txHost);
  }
}
