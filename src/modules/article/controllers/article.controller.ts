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
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { ArticleService } from '../services/article.service';
import { ResponseArticleDto } from '../dtos/article.response.dto';
import { CreateArticleDto } from '../dtos/article.create.dto';
import { UpdateArticleDto } from '../dtos/article.update.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { QrCodeService } from '../services/codeQr.service';
import { BarcodeService } from '../services/BarcodeService';

@ApiTags('article')
@Controller({
  version: '1',
  path: '/article',
})
export class ArticleController {
  constructor(private readonly articleService: ArticleService,
    private readonly qrCodeService: QrCodeService,
    private readonly barCodeService: BarcodeService) {}

  @Post('/save-with-filter-title')
  async saveWithFilterTitle(
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<ResponseArticleDto | { message: string }> {
    const existingArticle = await this.articleService.saveWithFilterTitle(createArticleDto);

    if (existingArticle) {
      return { message: 'L\'article avec ce titre existe déjà.' };
    }

    return await this.articleService.save(createArticleDto);
  }

  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseArticleDto[]> {
    return await this.articleService.findAll(options);
  }

  @Get('/list')
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseArticleDto>> {
    return await this.articleService.findAllPaginated(query);
  }

  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(
    @Param('id') id: number,
    @Query() query: IQueryObject,
  ): Promise<ResponseArticleDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return await this.articleService.findOneByCondition(query);
  }

  @Post('/save')
  async save(
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<ResponseArticleDto> {
    return await this.articleService.save(createArticleDto);
  }

  @Put('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async update(
    @Param('id') id: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<ResponseArticleDto> {
    return await this.articleService.update(id, updateArticleDto);
  }

  @Delete('/delete/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async delete(@Param('id') id: number): Promise<ResponseArticleDto> {
    return await this.articleService.softDelete(id);
  }

  @Post('/generate-qr')
  async generateQrCode(@Body('data') data: string) {
    return this.qrCodeService.generateQrCode(data);
  }

  @Get('/qr/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
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
      const article = await this.articleService.findByQrCode(qrCode);
  
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

// Dans ArticleController.ts

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


/*
  @Post('import-csv')
@UseInterceptors(FileInterceptor('file', {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 Mo
  },
}))
async importCSV(@UploadedFile() file: Express.Multer.File) {
  if (!file) {
    throw new BadRequestException('Aucun fichier n\'a été envoyé');
  }

  console.log('Fichier reçu:', file); // Log pour déboguer
  console.log('Nom du fichier:', file.originalname);
  console.log('Taille du fichier:', file.size);
  console.log('Type MIME:', file.mimetype);

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
}*/
/*@Post('import-excel')
  @UseInterceptors(FileInterceptor('file')) // 'file' doit correspondre au nom du champ dans FormData
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier n\'a été envoyé.');
    }

    // Vérifiez le type de fichier
    if (
      !file.mimetype.includes('excel') &&
      !file.mimetype.includes('spreadsheet')
    ) {
      throw new BadRequestException('Seuls les fichiers Excel sont autorisés.');
    }

    try {
      const result = await this.articleImportService.importExcel(file);
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }*/
}