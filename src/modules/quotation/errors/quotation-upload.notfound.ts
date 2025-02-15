import { HttpException, HttpStatus } from '@nestjs/common';

export class QuotationUploadNotFoundException extends HttpException {
  constructor() {
    super('Quotation upload not found', HttpStatus.NOT_FOUND);
  }
}
