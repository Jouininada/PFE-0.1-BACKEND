import { Module } from '@nestjs/common';
import { MigrationService } from './services/database-migration.service';
import { DatabaseRepositoryModule } from './repositories/database.repository.module';

@Module({
  imports: [DatabaseRepositoryModule],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class DatabaseModule {}
