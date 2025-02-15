import { Module } from '@nestjs/common';
import { CabinetRepository } from './repository/cabinet.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CabinetEntity } from './entities/cabinet.entity';

@Module({
  controllers: [],
  providers: [CabinetRepository],
  exports: [CabinetRepository],
  imports: [TypeOrmModule.forFeature([CabinetEntity])],
})
export class CabinetRepositoryModule {}
