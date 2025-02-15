import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadRepository } from './repository/upload.repository';
import { UploadEntity } from './entities/upload.entity';

@Module({
  controllers: [],
  providers: [UploadRepository],
  exports: [UploadRepository],
  imports: [TypeOrmModule.forFeature([UploadEntity])],
})
export class UploadRepositoryModule {}
