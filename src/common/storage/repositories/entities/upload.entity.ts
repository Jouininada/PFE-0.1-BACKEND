import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('upload')
export class UploadEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  filename: any;

  @Column({ type: 'varchar' })
  relativePath: any;

  @Column({ type: 'varchar', length: 255 })
  mimetype: any;

  @Column({ type: 'float' })
  size: number;
}
