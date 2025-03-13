import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ArticleHistoryEntity } from '../entities/article-history.entity';

@Injectable()
export class ArticleHistoryRepository extends Repository<ArticleHistoryEntity> {
  constructor(private dataSource: DataSource) {
    super(ArticleHistoryEntity, dataSource.createEntityManager());
  }

  // Méthode pour créer une entrée d'historique
  async createHistoryEntry(historyData: {
    version: number;
    changes: Record<string, { oldValue: any; newValue: any }>;
    articleId: number;
  }): Promise<ArticleHistoryEntity> {
    const historyEntry = this.create({
      version: historyData.version,
      changes: historyData.changes,
      articleId: historyData.articleId,
      date: new Date(),
    });

    return this.save(historyEntry);
  }

  // Méthode pour récupérer l'historique d'un article
  async getArticleHistory(articleId: number): Promise<ArticleHistoryEntity[]> {
    return this.find({
      where: { articleId },
      order: { date: 'DESC' }, // Trie par date décroissante
    });
  }
}