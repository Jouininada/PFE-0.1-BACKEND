import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleRepository } from './repository/article.repository';
import { ArticleEntity } from './entities/article.entity';

@Module({
  controllers: [],
  providers: [ArticleRepository],
  exports: [ArticleRepository],
  imports: [TypeOrmModule.forFeature([ArticleEntity])],
})
export class ArticleRepositoryModule {}
