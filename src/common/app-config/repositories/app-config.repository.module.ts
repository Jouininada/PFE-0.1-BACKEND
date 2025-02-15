import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigRepository } from './repository/app-config.repository';
import { AppConfigEntity } from './entities/app-config.entity';

@Module({
  controllers: [],
  providers: [AppConfigRepository],
  exports: [AppConfigRepository],
  imports: [TypeOrmModule.forFeature([AppConfigEntity])],
})
export class AppConfigRepositoryModule {}
