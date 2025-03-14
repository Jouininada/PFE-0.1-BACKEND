import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  NotFoundException,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express'; // Importez Response pour gérer la réponse HTTP
import { ArticleHistoryService } from '../services/article-history.service';
import { ApiTags, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreateArticleHistoryDto } from '../dtos/createArticleHistoryDto';
import { ResponseArticleHistoryDto } from '../dtos/responseArticleHistoryDto';
import * as fs from 'fs'; // Importation du module fs pour gérer les fichiers
import { ArticleService } from 'src/modules/article/services/article.service';

@ApiTags('Article History')
@Controller('article-history')
export class ArticleHistoryController {
  constructor(
    private readonly articleHistoryService: ArticleHistoryService,
    private readonly articleService: ArticleService,
  ) {}

  @Post('create')
  @ApiBody({ type: CreateArticleHistoryDto })
  @ApiResponse({ status: 201, type: ResponseArticleHistoryDto })
  async createHistoryEntry(
    @Body() createArticleHistoryDto: CreateArticleHistoryDto,
  ): Promise<ResponseArticleHistoryDto> {
    return this.articleHistoryService.createHistoryEntry(createArticleHistoryDto);
  }

  @Get(':articleId/history')
  @ApiParam({ name: 'articleId', type: 'number' })
  @ApiResponse({ status: 200, type: [ResponseArticleHistoryDto] })
  async getArticleHistory(
    @Param('articleId') articleId: number,
  ): Promise<ResponseArticleHistoryDto[]> {
    const history = await this.articleHistoryService.getArticleHistory(articleId);

    if (!history || history.length === 0) {
      throw new NotFoundException('Aucun historique trouvé pour cet article.');
    }

    return history;
  }

  @Get(':articleId/generate-files')
  @ApiParam({ name: 'articleId', type: 'number' })
  @ApiResponse({ status: 200, description: 'Fichiers PDF générés avec succès.', type: [String] })
  async generateVersionFiles(@Param('articleId') articleId: number): Promise<string[]> {
    try {
      // Récupérer l'article actuel
      const article = await this.articleService.findOneById(articleId);
      if (!article) {
        throw new NotFoundException('Article non trouvé.');
      }
  
      // Générer les fichiers pour cet article
      const pdfFilePaths = await this.articleHistoryService.generateVersionFile(article);
  
      // Retourner les chemins des fichiers PDF générés
      return pdfFilePaths;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get(':articleId/version/:version/download-pdf')
@ApiParam({ name: 'articleId', type: 'number' })
@ApiParam({ name: 'version', type: 'number' })
async downloadVersionPdf(
  @Param('articleId') articleId: number,
  @Param('version') version: number,
  @Res() res: Response, // Utilisez Response pour envoyer le fichier
) {
  try {
    // Récupérer l'article
    const article = await this.articleService.findOneById(articleId);
    if (!article) {
      throw new NotFoundException('Article non trouvé.');
    }

    // Récupérer le chemin du fichier PDF pour la version spécifiée
    const pdfFilePath = await this.articleHistoryService.getVersionFilePath(articleId, version);

    // Vérifier si le fichier existe
    if (!pdfFilePath || !fs.existsSync(pdfFilePath)) {
      throw new NotFoundException(`Fichier PDF pour la version ${version} non trouvé.`);
    }

    // Envoyer le fichier en réponse
    res.download(pdfFilePath, `article_${articleId}_version_${version}.pdf`, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement du fichier :', err);
        res.status(500).send('Erreur lors du téléchargement du fichier.');
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération ou du téléchargement du PDF :', error);
    res.status(500).send(error.message || 'Erreur lors du téléchargement du PDF.');
  }
}

} 














