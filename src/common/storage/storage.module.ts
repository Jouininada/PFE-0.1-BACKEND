import { Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { UploadRepositoryModule } from './repositories/storage.repository.module';

@Module({
  controllers: [],
  providers: [StorageService],
  exports: [StorageService],
  imports: [UploadRepositoryModule],
})
export class StorageModule {}
