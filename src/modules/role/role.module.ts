import { Module } from '@nestjs/common';
import { RoleService } from './services/role.service';
import { RoleRepository } from './repositories/repository/role.repository';
import { RoleEntity } from './repositories/entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionEntryService } from './services/role-permission-entry.service';
import { RolePermissionEntryRepository } from './repositories/repository/role-permission.repository';
import { RolePermissionEntryEntity } from './repositories/entities/role-permission-entry.entity';

@Module({
  controllers: [],
  providers: [
    RoleService,
    RolePermissionEntryService,
    RoleRepository,
    RolePermissionEntryRepository,
  ],
  exports: [
    RoleService,
    RolePermissionEntryService,
    RoleRepository,
    RolePermissionEntryRepository,
  ],
  imports: [
    TypeOrmModule.forFeature([RoleEntity]),
    TypeOrmModule.forFeature([RolePermissionEntryEntity]),
  ],
})
export class RoleModule {}
