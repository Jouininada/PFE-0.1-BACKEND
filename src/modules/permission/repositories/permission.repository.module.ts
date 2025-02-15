import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { PermissionRepository } from './repository/permission.repository';

@Module({
  controllers: [],
  providers: [PermissionRepository],
  exports: [PermissionRepository],
  imports: [TypeOrmModule.forFeature([PermissionEntity])],
})
export class PermissionRepositoryModule {}
