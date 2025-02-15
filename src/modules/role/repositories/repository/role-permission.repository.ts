import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { RolePermissionEntryEntity } from '../entities/role-permission-entry.entity';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';

@Injectable()
export class RolePermissionEntryRepository extends DatabaseAbstractRepository<RolePermissionEntryEntity> {
  constructor(
    @InjectRepository(RolePermissionEntryEntity)
    private readonly rolePermissionEntryRepository: Repository<RolePermissionEntryEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(rolePermissionEntryRepository, txHost);
  }
}
