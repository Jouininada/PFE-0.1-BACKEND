import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleHistoryEntity } from './entities/article-history.entity';
import { ArticleHistoryRepository } from './repository/article-history.repository';


@Module({
  imports: [TypeOrmModule.forFeature([ArticleHistoryEntity])], // Importez l'entité
  providers: [ArticleHistoryRepository], // Fournit ArticleHistoryRepository
  exports: [ArticleHistoryRepository], // Exporte ArticleHistoryRepository
})
export class ArticleHistoryRepositoryModule {}