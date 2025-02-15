import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { FirmEntity } from 'src/modules/firm/repositories/entities/firm.entity';
import { InterlocutorEntity } from 'src/modules/interlocutor/repositories/entity/interlocutor.entity';

@Entity('firm_interlocutor_entry')
export class FirmInterlocutorEntryEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => FirmEntity)
  @JoinColumn({ name: 'firmId' })
  firm: FirmEntity;

  @Column({ type: 'int' })
  firmId: number;

  @ManyToOne(() => InterlocutorEntity)
  @JoinColumn({ name: 'interlocutorId' })
  interlocutor: InterlocutorEntity;

  @Column({ type: 'int' })
  interlocutorId: number;

  @Column({ type: 'boolean', default: false })
  isMain: boolean;

  @Column({ type: 'varchar', length: 255 })
  position: string;
}
