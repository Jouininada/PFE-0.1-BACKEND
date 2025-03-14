import { Injectable } from '@nestjs/common';
import { ArticleHistoryEntity } from '../repositories/entities/article-history.entity';
import { ArticleHistoryRepository } from '../repositories/repository/article-history.repository';
import * as path from 'path';
import { ArticleEntity } from 'src/modules/article/repositories/entities/article.entity';
import * as fs from 'fs';
import { PdfService } from 'src/common/pdf/services/pdf.service';
import puppeteer from 'puppeteer';

@Injectable()
export class ArticleHistoryService {
  constructor(
    private readonly articleHistoryRepository: ArticleHistoryRepository,
    private readonly pdfService: PdfService, // Injecter PdfService
    
  ) {}

  async createHistoryEntry(historyData: {
    version: number;
    changes: Record<string, { oldValue: any; newValue: any }>;
    articleId: number;
  }): Promise<ArticleHistoryEntity> {
    return this.articleHistoryRepository.createHistoryEntry(historyData);
  }

  async getArticleHistory(articleId: number): Promise<ArticleHistoryEntity[]> {
    return this.articleHistoryRepository.find({
      where: { articleId },
      order: { date: 'DESC' },
    });
  }

  async generateVersionFile(article: ArticleEntity): Promise<string> {
    try {
      // Récupérer l'historique de l'article
      const history = await this.getArticleHistory(article.id);
  
      if (!history || history.length === 0) {
        throw new Error('Aucun historique trouvé pour cet article.');
      }
  
      // Créer le dossier "uploads" s'il n'existe pas
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
  
      // Générer le contenu HTML pour le PDF
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              h1 { color: #25306e; }
              .version { margin-bottom: 20px; }
              .version h2 { color: #fbd754; }
              .version p { margin: 5px 0; }
            </style>
          </head>
          <body>
            <h1>Fiche Article - ${article.title}</h1>
            ${history
              .map(
                (entry) => `
              <div class="version">
                <h2>Version ${entry.version}</h2>
                <p><strong>Date :</strong> ${entry.date.toISOString()}</p>
                <p><strong>Modifications :</strong></p>
                <pre>${JSON.stringify(entry.changes, null, 2)}</pre>
              </div>
            `,
              )
              .join('')}
          </body>
        </html>
      `;
  
      // Créer un fichier PDF à partir du HTML
      const pdfFileName = `article_${article.id}_fiche.pdf`;
      const pdfFilePath = path.join(uploadsDir, pdfFileName);
  
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      await page.pdf({ path: pdfFilePath, format: 'A4' });
      await browser.close();
  
      return pdfFilePath; // Retourner le chemin du fichier PDF
    } catch (error) {
      console.error('Erreur lors de la génération du fichier PDF :', error);
      throw new Error('Erreur lors de la génération du fichier PDF.');
    }
  }
}