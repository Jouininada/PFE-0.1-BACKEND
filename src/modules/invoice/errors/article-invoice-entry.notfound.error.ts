import { HttpException, HttpStatus } from '@nestjs/common';

export class ArticleInvoiceEntryNotFoundException extends HttpException {
  constructor() {
    super('Article Invoice Entry not found', HttpStatus.NOT_FOUND);
  }
}
