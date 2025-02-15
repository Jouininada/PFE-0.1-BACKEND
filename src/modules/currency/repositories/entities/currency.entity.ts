import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('currency')
export class CurrencyEntity extends EntityHelper {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  label: string;

  @Column({ type: 'varchar', length: 3, nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  symbol: string;

  @Column({ type: 'int', nullable: true })
  digitAfterComma: number;
}
