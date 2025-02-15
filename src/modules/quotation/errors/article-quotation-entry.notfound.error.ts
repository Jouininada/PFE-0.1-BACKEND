import { HttpException, HttpStatus } from '@nestjs/common';

export class ArticleQuotationEntryNotFoundException extends HttpException {
  constructor() {
    super('Article Quotation Entry not found', HttpStatus.NOT_FOUND);
  }
}
