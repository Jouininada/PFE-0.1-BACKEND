import { Injectable } from '@nestjs/common';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { ArticleRepository } from '../repositories/repository/article.repository';
import { ArticleEntity } from '../repositories/entities/article.entity';
import { ArticleNotFoundException } from '../errors/article.notfound.error';
import { ResponseArticleDto } from '../dtos/article.response.dto';
import { CreateArticleDto } from '../dtos/article.create.dto';
import { UpdateArticleDto } from '../dtos/article.update.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';

@Injectable()
export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async findOneById(id: number): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOneById(id);
    if (!article) {
      throw new ArticleNotFoundException();
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

  async save(createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
    return this.articleRepository.save(createArticleDto);
  }

  async saveMany(
    createArticleDtos: CreateArticleDto[],
  ): Promise<ArticleEntity[]> {
    return this.articleRepository.saveMany(createArticleDtos);
  }

  async update(
    id: number,
    updateActivityDto: UpdateArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.findOneById(id);
    return this.articleRepository.save({
      ...article,
      ...updateActivityDto,
    });
  }

  async softDelete(id: number): Promise<ArticleEntity> {
    await this.findOneById(id);
    return this.articleRepository.softDelete(id);
  }

  async deleteAll() {
    return this.articleRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.articleRepository.getTotalCount();
  }
}
