import { HttpException, HttpStatus } from '@nestjs/common';

export class InvoiceMetaDataNotFoundException extends HttpException {
  constructor() {
    super('Invoice Meta Data not found', HttpStatus.NOT_FOUND);
  }
}
