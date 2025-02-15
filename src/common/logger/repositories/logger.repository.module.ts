import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerRepository } from './repository/logger.repository';
import { LoggerEntity } from './entities/logger.entity';

@Module({
  controllers: [],
  providers: [LoggerRepository],
  exports: [LoggerRepository],
  imports: [TypeOrmModule.forFeature([LoggerEntity])],
})
export class LoggerRepositoryModule {}
