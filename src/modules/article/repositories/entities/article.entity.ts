import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('article')
export class ArticleEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })  // `unique: true` ajoute une contrainte unique
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;
}
