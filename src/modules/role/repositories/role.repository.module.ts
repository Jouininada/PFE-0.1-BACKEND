import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleRepository } from './repository/role.repository';
import { RolePermissionEntryRepository } from './repository/role-permission.repository';
import { RolePermissionEntryEntity } from './entities/role-permission-entry.entity';
import { RoleEntity } from './entities/role.entity';

@Module({
  controllers: [],
  providers: [RoleRepository, RolePermissionEntryRepository],
  exports: [RoleRepository, RolePermissionEntryRepository],
  imports: [
    TypeOrmModule.forFeature([RoleEntity]),
    TypeOrmModule.forFeature([RolePermissionEntryEntity]),
  ],
})
export class RoleRepositoryModule {}
