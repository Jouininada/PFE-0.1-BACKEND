import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { CountryEntity } from 'src/modules/country/repositories/entities/country.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('address')
export class AddressEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address2: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  region: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  zipcode: string;

  @ManyToOne(() => CountryEntity, { eager: true })
  @JoinColumn({ name: 'countryId' })
  country: CountryEntity;

  @Column({ type: 'int', nullable: true })
  countryId: number;
}
