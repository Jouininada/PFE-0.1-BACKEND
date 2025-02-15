import { HttpException, HttpStatus } from '@nestjs/common';

export class QuotationMetaDataNotFoundException extends HttpException {
  constructor() {
    super('Quotation Meta Data not found', HttpStatus.NOT_FOUND);
  }
}
