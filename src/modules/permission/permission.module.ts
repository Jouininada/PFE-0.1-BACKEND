import { Module } from '@nestjs/common';
import { PermissionService } from './services/permission.service';
import { PermissionRepositoryModule } from './repositories/permission.repository.module';

@Module({
  controllers: [],
  providers: [PermissionService],
  exports: [PermissionService],
  imports: [PermissionRepositoryModule],
})
export class PermissionModule {}
