import { Injectable, NotFoundException } from '@nestjs/common';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { ArticleRepository } from '../repositories/repository/article.repository';
import { ArticleEntity } from '../repositories/entities/article.entity';
import { ResponseArticleDto } from '../dtos/article.response.dto';
import { CreateArticleDto } from '../dtos/article.create.dto';
import { UpdateArticleDto } from '../dtos/article.update.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { QrCodeService } from './codeQr.service';
import { decodeBase64 } from 'bcryptjs';
import { BarcodeService } from './BarcodeService';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly qrCodeService: QrCodeService , // Injectez le service QR Code

    private readonly barcodeService: BarcodeService, // Injectez le service Barcode
  ) {}
  
  async saveBarCode(createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
    const qrCodeData = JSON.stringify({
      sku: createArticleDto.sku,
      title: createArticleDto.title,
      price: createArticleDto.salePrice,
    });
  
    const qrCode = await this.qrCodeService.generateQrCode(qrCodeData);
    const barcode = await this.barcodeService.generateBarcode(createArticleDto.barcode);
  
    const article = this.articleRepository.create({
      ...createArticleDto,
      qrCode,
      barcode, // Ajouter le code-barres généré
    });
  
    return this.articleRepository.save(article);
  }

  async ScanByBarcode(barcode: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({
      where: { barcode },
    });
  
    if (!article) {
      throw new NotFoundException('Aucun article trouvé avec ce code-barres.');
    }
  
    return article;
  }

  async findOneById(id: number): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOneById(id);
    if (!article) {
      throw new NotFoundException('Article non trouvé');
    }
    return article;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseArticleDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const article = await this.articleRepository.findOne(
      queryOptions as FindOneOptions<ArticleEntity>,
    );
    if (!article) return null;
    return article;
  }

  async findAll(query: IQueryObject): Promise<ResponseArticleDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.articleRepository.findAll(
      queryOptions as FindManyOptions<ArticleEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseArticleDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.articleRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.articleRepository.findAll(
      queryOptions as FindManyOptions<ArticleEntity>,
    );

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: {
        page: parseInt(query.page),
        take: parseInt(query.limit),
      },
      itemCount: count,
    });

    return new PageDto(entities, pageMetaDto);
  }

  async findByQrCode(qrCode: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({
      where: { qrCode },
    });

    if (!article) {
      throw new NotFoundException('Aucun article trouvé avec ce code QR.');
    }

    return article;
  }

  
  async saveMany(createArticleDtos: CreateArticleDto[]): Promise<ArticleEntity[]> {
    const articlesWithQrCode = await Promise.all(
      createArticleDtos.map(async (dto) => {
        const qrCodeData = JSON.stringify({
          sku: dto.sku,
          title: dto.title,
          price: dto.salePrice,
        });
  
        const qrCode = await this.qrCodeService.generateQrCode(qrCodeData);
  
        return this.articleRepository.create({
          ...dto,
          qrCode,
          barcode: dto.barcode, // Ajouter le code-barres
        });
      }),
    );
  
    return this.articleRepository.saveMany(articlesWithQrCode);
  }




  async deleteAll() {
    return this.articleRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.articleRepository.getTotalCount();
  }

  async saveWithFilterTitle(
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity | null> {
    try {
      const existingArticle = await this.articleRepository.findOne({
        where: { title: createArticleDto.title },
      });

      if (existingArticle) {
        console.log(`Article avec le titre "${createArticleDto.title}" existe déjà.`);
        return null;
      }

      // Générer un code QR pour le nouvel article
      const qrCodeData = JSON.stringify({
        sku: createArticleDto.sku,
        title: createArticleDto.title,
        price: createArticleDto.salePrice,
      });

      const qrCode = await this.qrCodeService.generateQrCode(qrCodeData);

      const newArticle = this.articleRepository.create({
        ...createArticleDto,
        qrCode, // Ajouter le code QR
      });

      return await this.articleRepository.save(newArticle);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'article', error);
      throw error;
    }
  }

  /*
  async importCSV(file: Express.Multer.File): Promise<ArticleEntity[]> {
    const articles: CreateArticleDto[] = [];
  
    return new Promise((resolve, reject) => {
      if (!file || !file.buffer) {
        reject(new Error('Le fichier est vide ou non valide'));
        return;
      }
  
      const fileContent = file.buffer.toString('utf-8');
      console.log('Contenu du fichier:', fileContent); // Log pour déboguer
  
      const rows = fileContent.split('\n');
      console.log('Nombre de lignes:', rows.length); // Log pour déboguer
  
      // Ignorer la première ligne (en-têtes)
      for (let i = 1; i < rows.length; i++) {
        const [title, description] = rows[i].split(',');
        if (title && description) {
          articles.push({ title, description });
        }
      }
  
      if (articles.length === 0) {
        reject(new Error('Aucun article valide trouvé dans le fichier CSV'));
        return;
      }
  
      this.articleRepository.saveMany(articles)
        .then((savedArticles) => resolve(savedArticles))
        .catch((error) => reject(error));
    });
  }*/

    // Dans ArticleService.ts

async save(createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
  const qrCodeData = JSON.stringify({
    sku: createArticleDto.sku,
    title: createArticleDto.title,
    price: createArticleDto.salePrice,
  });
  const qrCode = await this.qrCodeService.generateQrCode(qrCodeData);

  const barcode = createArticleDto.barcode;

  const article = this.articleRepository.create({
    ...createArticleDto,
    qrCode,
    barcode,
  });

  return this.articleRepository.save(article);
}
  
    async update(
      id: number,
      updateArticleDto: UpdateArticleDto,
    ): Promise<ArticleEntity> {
      const article = await this.findOneById(id);
  
      // Si le SKU, le titre ou le prix est mis à jour, régénérer le code QR
      if (updateArticleDto.sku || updateArticleDto.title || updateArticleDto.salePrice) {
        const qrCodeData = JSON.stringify({
          sku: updateArticleDto.sku || article.sku,
          title: updateArticleDto.title || article.title,
          price: updateArticleDto.salePrice || article.salePrice,
        });
  
        const qrCode = await this.qrCodeService.generateQrCode(qrCodeData);
        article.qrCode = qrCode; // Mettre à jour le code QR
      }
  
      // Si le code-barres est mis à jour, mettre à jour le texte du code-barres
      if (updateArticleDto.barcode) {
        article.barcode = updateArticleDto.barcode;
      }
  
      // Mettre à jour les autres champs
      return this.articleRepository.save({
        ...article,
        ...updateArticleDto,
      });
    }
  
    async softDelete(id: number): Promise<ArticleEntity> {
      await this.findOneById(id);
      return this.articleRepository.softDelete(id);
    }
  
    async findByBarcode(barcode: string): Promise<ArticleEntity> {
      const article = await this.articleRepository.findOne({
        where: { barcode },
      });
  
      if (!article) {
        throw new NotFoundException('Aucun article trouvé avec ce code-barres.');
      }
  
      return article;
    }
  
}