import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { RoleEntity } from '../entities/role.entity';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';

@Injectable()
export class RoleRepository extends DatabaseAbstractRepository<RoleEntity> {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(roleRepository, txHost);
  }
}
