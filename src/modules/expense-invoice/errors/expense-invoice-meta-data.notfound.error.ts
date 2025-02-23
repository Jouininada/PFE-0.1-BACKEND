import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpenseInvoiceMetaDataNotFoundException extends HttpException {
  constructor() {
    super('Invoice Meta Data not found', HttpStatus.NOT_FOUND);
  }
}