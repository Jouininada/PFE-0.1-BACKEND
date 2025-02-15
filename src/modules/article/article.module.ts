import { Module } from '@nestjs/common';
import { ArticleService } from './services/article.service';
import { ArticleRepositoryModule } from './repositories/article.repository.module';

@Module({
  controllers: [],
  providers: [ArticleService],
  exports: [ArticleService],
  imports: [ArticleRepositoryModule],
})
export class ArticleModule {}
