import { Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { LoggerRepositoryModule } from './repositories/logger.repository.module';

@Module({
  controllers: [],
  providers: [LoggerService],
  exports: [LoggerService],
  imports: [LoggerRepositoryModule],
})
export class LoggerModule {}
