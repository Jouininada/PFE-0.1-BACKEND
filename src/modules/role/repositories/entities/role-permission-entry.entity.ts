import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { PermissionEntity } from 'src/modules/permission/repositories/entities/permission.entity';

@Entity('role_permission')
export class RolePermissionEntryEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RoleEntity)
  @JoinColumn({ name: 'roleId' })
  role: RoleEntity;

  @Column({ type: 'int' })
  roleId: number;

  @ManyToOne(() => PermissionEntity)
  @JoinColumn({ name: 'permissionId' })
  permission: PermissionEntity;

  @Column({ type: 'int' })
  permissionId: number;
}
