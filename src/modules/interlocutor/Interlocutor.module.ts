import { Module } from '@nestjs/common';
import { InterlocutorService } from './services/interlocutor.service';
import { InterlocutorRepositoryModule } from './repositories/interlocutor.repository.module';
import { FirmInterlocutorEntryModule } from '../firm-interlocutor-entry/firm-interlocutor-entry.module';

@Module({
  controllers: [],
  providers: [InterlocutorService],
  exports: [InterlocutorService],

  imports: [InterlocutorRepositoryModule, FirmInterlocutorEntryModule],
})
export class InterlocutorModule {}
