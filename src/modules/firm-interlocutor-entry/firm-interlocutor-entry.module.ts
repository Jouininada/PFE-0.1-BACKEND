import { Module } from '@nestjs/common';
import { FirmInterlocutorEntryService } from './services/firm-interlocutor-entry.service';
import { FirmInterlocutorEntryRepositoryModule } from './repositories/firm-interlocutor-entry.repository.module';

@Module({
  controllers: [],
  providers: [FirmInterlocutorEntryService],
  exports: [FirmInterlocutorEntryService],
  imports: [FirmInterlocutorEntryRepositoryModule],
})
export class FirmInterlocutorEntryModule {}
