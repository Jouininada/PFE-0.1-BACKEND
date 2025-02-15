import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MigrationRepository } from './repository/migration.repository';
import { MigrationEntity } from './entities/migration.entity';

@Module({
  controllers: [],
  providers: [MigrationRepository],
  exports: [MigrationRepository],
  imports: [TypeOrmModule.forFeature([MigrationEntity])],
})
export class DatabaseRepositoryModule {}
