import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterlocutorEntity } from '../entity/interlocutor.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class InterlocutorRepository extends DatabaseAbstractRepository<InterlocutorEntity> {
  constructor(
    @InjectRepository(InterlocutorEntity)
    private readonly interlocutorRepository: Repository<InterlocutorEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(interlocutorRepository, txHost);
  }
}
