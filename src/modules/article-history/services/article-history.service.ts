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



async getVersionFilePath(articleId: number, version: number): Promise<string> {
  // Chemin du dossier de l'article
  const articleDir = path.join(__dirname, '..', '..', 'uploads', `article_${articleId}`);

  // Chemin du fichier PDF pour la version spécifiée
  const pdfFilePath = path.join(articleDir, `article_${articleId}_version_${version}.pdf`);

  // Vérifier si le fichier existe
  if (fs.existsSync(pdfFilePath)) {
    return pdfFilePath;
  }

  // Si le fichier n'existe pas, retourner null
  return null;
}


async generateVersionFile(article: ArticleEntity): Promise<string[]> {
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

  // Créer un dossier spécifique pour cet article
  const articleDir = path.join(uploadsDir, `article_${articleId}`);
  if (!fs.existsSync(articleDir)) {
    fs.mkdirSync(articleDir, { recursive: true });
  }

  const filePaths: string[] = [];

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
    qrCode: article.qrCode,
  };

  // Parcourir chaque entrée d'historique pour générer un PDF
  for (const entry of history) {
    const data = {
      version: entry.version,
      date: entry.date.toISOString(),
      article: currentState,
      changes: entry.changes,
    };

    // Générer le PDF en utilisant PdfService
    const pdfBuffer = await this.pdfService.generatePdf(data, 'template4');

    // Enregistrer le PDF
    const fileName = `article_${articleId}_version_${entry.version}.pdf`;
    const filePath = path.join(articleDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    filePaths.push(filePath);
  }

  // Générer un PDF pour la version actuelle (nouvelle version)
  const currentData = {
    version: article.version,
    date: new Date().toISOString(),
    article: currentState,
    changes: {}, // Aucun changement pour la version actuelle
  };

  const currentPdfBuffer = await this.pdfService.generatePdf(currentData, 'template4');
  const currentFileName = `article_${articleId}_version_${article.version}.pdf`;
  const currentFilePath = path.join(articleDir, currentFileName);
  fs.writeFileSync(currentFilePath, currentPdfBuffer);

  filePaths.push(currentFilePath);

  return filePaths; // Retourner les chemins des fichiers PDF générés
}
}