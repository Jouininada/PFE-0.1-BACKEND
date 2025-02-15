import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { AddressEntity } from 'src/modules/address/repositories/entities/address.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity('country')
export class CountryEntity extends EntityHelper {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 2, nullable: true })
  alpha2code: string;

  @Column({ type: 'varchar', length: 3, nullable: true })
  alpha3code: string;

  @OneToMany(() => AddressEntity, (address) => address.country)
  addresses: AddressEntity[];
}
