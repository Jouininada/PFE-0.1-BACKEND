import { Module } from '@nestjs/common';
import { ArticleService } from './services/article.service';
import { ArticleRepositoryModule } from './repositories/article.repository.module';
import { QrCodeService } from './services/codeQr.service';
import { BarcodeService } from './services/BarcodeService';

@Module({
  controllers: [],
  providers: [ArticleService , QrCodeService , BarcodeService],
  exports: [ArticleService , QrCodeService , BarcodeService],
  imports: [ArticleRepositoryModule], // Ajout de QrCodeModule
})
export class ArticleModule {}
