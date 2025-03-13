import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ArticleHistoryEntity } from 'src/modules/article-history/repositories/entities/article-history.entity';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';

@Entity('article') // Utilisez 'article' au lieu de 'articles'
export class ArticleEntity extends EntityHelper{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: true })
  title: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salePrice: number;

  @Column({ default: 0 })
  quantityInStock: number;

  @Column({ length: 5000, nullable: true })
  qrCode: string;

  @Column({ length: 50, nullable: true })
  subCategory: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchasePrice: number;

  @Column({ length: 50 })
  category: string;

  @Column({ length: 5000, nullable: true })
  barcode: string;

  @Column({ length: 50, default: 'draft' })
  status: string;

  @Column({ default: 1 })
  version: number;

  @OneToMany(() => ArticleHistoryEntity, (history) => history.article)
  history: ArticleHistoryEntity[]; // Relation avec l'historique
}