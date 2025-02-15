import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirmRepository } from './repository/firm.repository';
import { FirmEntity } from './entities/firm.entity';

@Module({
  controllers: [],
  providers: [FirmRepository],
  exports: [FirmRepository],
  imports: [TypeOrmModule.forFeature([FirmEntity])],
})
export class FirmRepositoryModule {}
