import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { UserEntity } from 'src/modules/user/repositories/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('logger')
export class LoggerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: EVENT_TYPE, nullable: true })
  event: EVENT_TYPE;

  @Column({ type: 'varchar', length: 255, nullable: true })
  api: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  method: string;

  @ManyToOne(() => UserEntity, (user) => user.logs, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @Column({ type: 'json', nullable: true })
  logInfo: any;

  @CreateDateColumn()
  loggedAt?: Date;
}
