import { Module } from '@nestjs/common';
import { ArticleHistoryRepositoryModule } from './repositories/article-history.repository.module';
import { ArticleHistoryService } from './services/article-history.service';
import { PdfModule } from 'src/common/pdf/pdf.module';

@Module({
  imports: [ArticleHistoryRepositoryModule,PdfModule], // Importez ArticleHistoryRepositoryModule
  providers: [ArticleHistoryService], // Fournit ArticleHistoryService
  exports: [ArticleHistoryService], // Exporte ArticleHistoryService
})
export class ArticleHistoryModule {}