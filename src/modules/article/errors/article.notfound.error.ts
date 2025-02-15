import { HttpException, HttpStatus } from '@nestjs/common';

export class ArticleNotFoundException extends HttpException {
  constructor() {
    super('Article not found', HttpStatus.NOT_FOUND);
  }
}
