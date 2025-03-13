import { Injectable } from '@nestjs/common';
import { ArticleHistoryEntity } from '../repositories/entities/article-history.entity';
import { ArticleHistoryRepository } from '../repositories/repository/article-history.repository';
import * as path from 'path';
import { ArticleEntity } from 'src/modules/article/repositories/entities/article.entity';
import * as fs from 'fs';
import { PdfService } from 'src/common/pdf/services/pdf.service';

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
    const articleId = article.id;

    // Récupérer l'historique de l'article
    const history = await this.getArticleHistory(articleId);
    if (!history || history.length === 0) {
        throw new Error('Aucun historique trouvé pour cet article.');
    }

    // Créer le dossier "uploads" s'il n'existe pas
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Initialiser l'état de l'article avec les valeurs actuelles
    let currentState = {
        id: article.id,
        title: article.title,
        description: article.description,
        category: article.category,
        subCategory: article.subCategory,
        purchasePrice: article.purchasePrice,
        salePrice: article.salePrice,
        quantityInStock: article.quantityInStock,
        barcode: article.barcode,
        status: article.status,
        version: article.version,
        qrCode: article.qrCode, // Inclure le code QR
    };

    // Générer le PDF pour la dernière version
    const lastEntry = history[0]; // Prendre la dernière entrée d'historique
    const data = {
        version: lastEntry.version,
        date: lastEntry.date.toISOString(),
        article: currentState,
        changes: lastEntry.changes,
    };

    // Générer le PDF en utilisant PdfService
    const pdfBuffer = await this.pdfService.generatePdf(data, 'template4');

    // Enregistrer le PDF
    const fileName = `article_${articleId}_fiche.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    return filePath; // Retourner le chemin du fichier PDF
}

}