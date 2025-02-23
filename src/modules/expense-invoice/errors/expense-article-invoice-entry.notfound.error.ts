import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpenseArticleInvoiceEntryNotFoundException extends HttpException {
  constructor() {
    super('Article Invoice Entry not found', HttpStatus.NOT_FOUND);
  }
}
