import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpenseInvoiceUploadNotFoundException extends HttpException {
  constructor() {
    super('Invoice upload not found', HttpStatus.NOT_FOUND);
  }
}
