import { ArticleEntity } from 'src/modules/article/repositories/entities/article.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('article_history') // Nom de la table dans la base de données
export class ArticleHistoryEntity {
  @PrimaryGeneratedColumn() // Colonne ID auto-générée
  id: number;

  @Column() // Version de l'article lors de la modification
  version: number;

  @Column('json') // Stocke les modifications sous forme de JSON
  changes: Record<string, { oldValue: any; newValue: any }>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Date de la modification
  date: Date;

  @ManyToOne(() => ArticleEntity, (article) => article.history) // Relation Many-to-One avec ArticleEntity
  @JoinColumn({ name: 'articleId' }) // Nom de la colonne de la clé étrangère
  article: ArticleEntity;

  @Column() // Clé étrangère vers l'article
  articleId: number;
}