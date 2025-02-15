import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolePermissionEntryEntity } from './role-permission-entry.entity';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { UserEntity } from 'src/modules/user/repositories/entities/user.entity';

@Entity('role')
export class RoleEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @OneToMany(
    () => RolePermissionEntryEntity,
    (rolePermission) => rolePermission.role,
  )
  permissionsEntries: RolePermissionEntryEntity[];

  @OneToMany(() => UserEntity, (user) => user.role)
  users: UserEntity[];
}
