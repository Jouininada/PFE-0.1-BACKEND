import { Module } from '@nestjs/common';
import { ArticleService } from './services/article.service';
import { ArticleRepositoryModule } from './repositories/article.repository.module';
import { QrCodeService } from './services/codeQr.service';
import { BarcodeService } from './services/BarcodeService';
import { ArticleHistoryModule } from '../article-history/article-history.module'; // Assurez-vous que le chemin est correct
import { PdfService } from 'src/common/pdf/services/pdf.service'; // Importez PdfService

@Module({
  imports: [ArticleRepositoryModule, ArticleHistoryModule], // Supprimez PdfService d'ici
  providers: [ArticleService, QrCodeService, BarcodeService, PdfService], // Ajoutez PdfService ici
  exports: [ArticleService, QrCodeService, BarcodeService, PdfService], // Exportez PdfService si nécessaire
})
export class ArticleModule {}