import { HttpException, HttpStatus } from '@nestjs/common';

export class QuotationNotFoundException extends HttpException {
  constructor() {
    super('Quotation not found', HttpStatus.NOT_FOUND);
  }
}
