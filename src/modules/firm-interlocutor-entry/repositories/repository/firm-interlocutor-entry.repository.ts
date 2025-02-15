import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirmInterlocutorEntryEntity } from '../entities/firm-interlocutor-entry.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class FirmInterlocutorEntryRepository extends DatabaseAbstractRepository<FirmInterlocutorEntryEntity> {
  constructor(
    @InjectRepository(FirmInterlocutorEntryEntity)
    private readonly firmInterlocutorEntryRepository: Repository<FirmInterlocutorEntryEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(firmInterlocutorEntryRepository, txHost);
  }
}
