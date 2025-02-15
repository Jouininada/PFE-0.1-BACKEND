import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tax')
export class TaxEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  label: string;

  @Column({ type: 'float', nullable: true })
  value: number;

  @Column({ type: 'boolean', default: true })
  isRate: boolean;

  @Column({ type: 'boolean', default: false })
  isSpecial: boolean;
}
