import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { Response } from 'express'; // Importez Response pour gérer la réponse HTTP
import { ApiTags, ApiParam, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { ArticleService } from '../services/article.service';
import { ResponseArticleDto } from '../dtos/article.response.dto';
import { CreateArticleDto } from '../dtos/article.create.dto';
import { UpdateArticleDto } from '../dtos/article.update.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { QrCodeService } from '../services/codeQr.service';
import { BarcodeService } from '../services/BarcodeService';
import * as fs from 'fs';
import * as archiver from 'archiver';
import { ArticleHistoryService } from 'src/modules/article-history/services/article-history.service';
import puppeteer from 'puppeteer';


@ApiTags('article')
@Controller({
  version: '1',
  path: '/article',
})
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly articleHistoryService: ArticleHistoryService,
    private readonly qrCodeService: QrCodeService,
    private readonly barCodeService: BarcodeService,
  ) {}

  @Post('/save-with-filter-title')
  async saveWithFilterTitle(@Body() createArticleDto: CreateArticleDto): Promise<ResponseArticleDto | { message: string }> {
    const existingArticle = await this.articleService.saveWithFilterTitle(createArticleDto);

    if (existingArticle) {
      return { message: 'L\'article avec ce titre existe déjà.' };
    }

    return await this.articleService.save(createArticleDto);
  }

  @Get('/all')
  @ApiResponse({
    status: 200,
    description: 'Retourne le nombre total d\'articles',
    schema: {
      type: 'object',
      properties: {
        total: {
          type: 'number',
          example: 104,
        },
      },
    },
  })
  async findAll(@Query() options: IQueryObject): Promise<{ total: number }> {
    return await this.articleService.findAll(options);
  }

  @Get('/list')
  async findAllPaginated(@Query() query: IQueryObject): Promise<PageDto<ResponseArticleDto>> {
    return await this.articleService.findAllPaginated(query);
  }

  @Get('/:id')
  @ApiParam({ name: 'id', type: 'number', required: true })
  async findOneById(@Param('id') id: string, @Query() query: IQueryObject): Promise<ResponseArticleDto> {
    try {
      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        throw new BadRequestException('ID doit être un nombre valide.');
      }

      query.filter ? (query.filter += `,id||$eq||${parsedId}`) : (query.filter = `id||$eq||${parsedId}`);

      return await this.articleService.findOneByCondition(query);
    } catch (error) {
      console.error('Erreur dans findOneById:', error);
      throw new BadRequestException('Erreur lors de la récupération de l\'article. Détails : ' + error.message);
    }
  }

  @Post('/save')
  async save(@Body() createArticleDto: CreateArticleDto): Promise<ResponseArticleDto> {
    return await this.articleService.save(createArticleDto);
  }

  @Put('/:id')
  @ApiParam({ name: 'id', type: 'number', required: true })
  async update(@Param('id') id: number, @Body() updateArticleDto: UpdateArticleDto): Promise<ResponseArticleDto> {
    return await this.articleService.update(id, updateArticleDto);
  }

  @Get('/article-details/:id')
  @ApiParam({ name: 'id', type: 'number', required: true })
  async getArticleDetails(@Param('id') id: number): Promise<ResponseArticleDto> {
    try {
      if (isNaN(id)) {
        throw new BadRequestException('ID doit être un nombre valide.');
      }

      const article = await this.articleService.getArticleDetails(id);

      if (!article) {
        throw new NotFoundException('Aucun article trouvé avec cet ID.');
      }

      return article;
    } catch (error) {
      console.error('Erreur dans getArticleDetails:', error);
      throw new BadRequestException('Erreur lors de la récupération des détails de l\'article.');
    }
  }

  @Delete('/delete/:id')
  @ApiParam({ name: 'id', type: 'number', required: true })
  async delete(@Param('id') id: number): Promise<ResponseArticleDto> {
    return await this.articleService.softDelete(id);
  }

  @Post('/generate-qr')
  async generateQrCode(@Body('data') data: string): Promise<{ qrCode: string }> {
    try {
      const qrCode = await this.qrCodeService.generateQrCode(data);
      return { qrCode };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la génération du code QR.');
    }
  }

  @Get('/qr/:id')
  @ApiParam({ name: 'id', type: 'number', required: true })
  async getQrCode(@Param('id') id: number) {
    const article = await this.articleService.findOneById(id);
    if (!article.qrCode) {
      return { message: 'Aucun code QR généré pour cet article.' };
    }
    return { qrCode: article.qrCode };
  }

  @Post('/search-by-qr')
  async searchByQrCode(@Body('qrCode') qrCode: string): Promise<ResponseArticleDto | { message: string }> {
    try {
      const url = new URL(qrCode);
      const id = parseInt(url.pathname.split('/').pop(), 10);

      if (isNaN(id)) {
        throw new BadRequestException('Le code QR ne contient pas un ID valide.');
      }

      const article = await this.articleService.getArticleDetails(id);

      if (!article) {
        return { message: 'Aucun article trouvé avec ce code QR.' };
      }

      return article;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('/generate-barcode')
  async generateBarcode(@Body('data') data: string) {
    if (!data || data.trim() === '') {
      throw new BadRequestException('Le texte du code-barres ne peut pas être vide.');
    }
    return this.barCodeService.generateBarcode(data);
  }

  @Post('/search-by-barcode')
  async searchByBarcode(@Body('barcode') barcode: string): Promise<ResponseArticleDto | { message: string }> {
    try {
      const article = await this.articleService.findByBarcode(barcode);

      if (!article) {
        return { message: 'Aucun article trouvé avec ce code-barres.' };
      }

      return article;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('/search-by-scan')
  async searchByScan(@Body('scannedData') scannedData: string): Promise<ResponseArticleDto | { message: string }> {
    try {
      const article = await this.articleService.ScanByBarcode(scannedData);

      if (!article) {
        return { message: 'Aucun article trouvé avec ce code-barres.' };
      }

      return article;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('import-csv')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  async importCSV(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier n\'a été envoyé');
    }

    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (fileExtension !== '.csv') {
      throw new BadRequestException('Seuls les fichiers CSV sont autorisés');
    }

    try {
      const importedArticles = await this.articleService.importCSV(file);
      return {
        message: `${importedArticles.length} articles ont été importés avec succès.`,
        data: importedArticles,
      };
    } catch (error) {
      console.error('Erreur lors de l\'importation du fichier CSV:', error);
      throw new BadRequestException('Une erreur est survenue lors de l\'importation du fichier CSV');
    }
  }

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier n\'a été envoyé.');
    }

    if (!file.mimetype.includes('excel') && !file.mimetype.includes('spreadsheet')) {
      throw new BadRequestException('Seuls les fichiers Excel sont autorisés.');
    }

    try {
      const result = await this.articleService.importExcel(file);
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id/history')
  @ApiParam({ name: 'id', type: 'number', required: true })
  async getArticleHistory(@Param('id') id: number): Promise<any[]> {
    const historyEntries = await this.articleService.getArticleHistory(id);
    return historyEntries.map((entry) => ({
      version: entry.version,
      changes: entry.changes,
      date: entry.date,
    }));
  }

  @Get(':id/sales-performance')
  @ApiParam({ name: 'id', type: 'number' })
  async getSalesPerformance(@Param('id') id: number) {
    return this.articleService.getSalesPerformance(id);
  }

  @Get('popular')
  async getPopularArticles(@Query('limit') limit: number = 10) {
    return this.articleService.getPopularArticles(limit);
  }

  @Get('stagnant')
  async getStagnantArticles(@Query('limit') limit: number = 10) {
    return this.articleService.getStagnantArticles(limit);
  }

  @Post(':id/optimize-stock')
  @ApiParam({ name: 'id', type: 'number' })
  async optimizeStock(@Param('id') id: number, @Body('newStockLevel') newStockLevel: number) {
    return this.articleService.optimizeStock(id, newStockLevel);
  }

  @Post(':id/adjust-price')
  @ApiParam({ name: 'id', type: 'number' })
  async adjustPrice(@Param('id') id: number, @Body('newPrice') newPrice: number) {
    return this.articleService.adjustPrice(id, newPrice);
  }

  @Get('stock-alerts')
  async getStockAlerts(@Query('threshold') threshold: number = 10) {
    return this.articleService.getStockAlerts(threshold);
  }

  @Get('promotion-recommendations')
  async getPromotionRecommendations() {
    return this.articleService.getPromotionRecommendations();
  }

  @Get('analyze-levels/:id')
  @ApiParam({ name: 'id', type: 'number', required: true, description: 'ID de l\'article à analyser' })
  async analyzeArticlesByLevels(@Param('id') id: string): Promise<{ message: string; data: any }> {
    try {
      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        throw new BadRequestException('ID doit être un nombre valide.');
      }

      return await this.articleService.analyzeArticlesByLevels(parsedId);
    } catch (error) {
      console.error('Erreur dans analyzeArticlesByLevels:', error);
      throw new BadRequestException('Erreur lors de l\'analyse des articles. Détails : ' + error.message);
    }
  }

  
  @Get(':articleId/download-pdf')
  @ApiParam({ name: 'articleId', type: 'number' })
  async downloadPdf(
    @Param('articleId') articleId: number,
    @Res() res: Response, // Utilisez Response pour envoyer le fichier
  ) {
    try {
      // Récupérer l'article
      const article = await this.articleService.findOneById(articleId);
      if (!article) {
        throw new NotFoundException('Article non trouvé.');
      }

      // Générer le fichier PDF
      const pdfFilePath = await this.articleHistoryService.generateVersionFile(article);

      // Envoyer le fichier en réponse
      res.download(pdfFilePath, `article_${articleId}_fiche.pdf`, (err) => {
        if (err) {
          console.error('Erreur lors du téléchargement du fichier :', err);
          res.status(500).send('Erreur lors du téléchargement du fichier.');
        }
      });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF :', error);
      res.status(500).send('Erreur lors de la génération du PDF.');
    }
  }

  
}