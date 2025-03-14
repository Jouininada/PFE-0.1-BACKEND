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
import { ArticleService } from 'src/modules/article/services/article.service';
import { ApiTags, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreateArticleHistoryDto } from '../dtos/createArticleHistoryDto';
import { ResponseArticleHistoryDto } from '../dtos/responseArticleHistoryDto';

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

    const pdfFilePaths = await this.articleHistoryService.generateVersionFile(article);
    return Array.isArray(pdfFilePaths) ? pdfFilePaths : [pdfFilePaths];
    
  } catch (error) {
    throw new NotFoundException(error.message);
  }
}

}