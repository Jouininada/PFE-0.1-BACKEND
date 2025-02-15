import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirmInterlocutorEntryEntity } from './entities/firm-interlocutor-entry.entity';
import { FirmInterlocutorEntryRepository } from './repository/firm-interlocutor-entry.repository';

@Module({
  controllers: [],
  providers: [FirmInterlocutorEntryRepository],
  exports: [FirmInterlocutorEntryRepository],
  imports: [TypeOrmModule.forFeature([FirmInterlocutorEntryEntity])],
})
export class FirmInterlocutorEntryRepositoryModule {}
