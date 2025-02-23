import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { ArticleService } from '../services/article.service';
import { ResponseArticleDto } from '../dtos/article.response.dto';
import { CreateArticleDto } from '../dtos/article.create.dto';
import { UpdateArticleDto } from '../dtos/article.update.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';

@ApiTags('article')
@Controller({
  version: '1',
  path: '/article',
})
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post('/save-with-filter-title')
  async saveWithFilterTitle(
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<ResponseArticleDto | { message: string }> {
    // Vérification si l'article existe déjà par titre via le service
    const existingArticle = await this.articleService.saveWithFilterTitle(createArticleDto);
    
    // Si un article existe déjà, on renvoie un message d'erreur
    if (existingArticle === null) {
      return { message: 'L\'article avec ce titre existe déjà.' };
    }
  
    // Sinon, on crée le nouvel article et on le retourne
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
}
