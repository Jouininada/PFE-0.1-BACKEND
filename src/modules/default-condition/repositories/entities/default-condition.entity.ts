import { ACTIVITY_TYPE } from 'src/app/enums/activity-types.enum';
import { DOCUMENT_TYPE } from 'src/app/enums/document-types.enum';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('default-condition')
export class DefaultConditionEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: DOCUMENT_TYPE, nullable: true })
  document_type: DOCUMENT_TYPE;

  @Column({ type: 'enum', enum: ACTIVITY_TYPE, nullable: true })
  activity_type: ACTIVITY_TYPE;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  value: string;
}
