import { HttpException, HttpStatus } from '@nestjs/common';

export class InvoiceUploadNotFoundException extends HttpException {
  constructor() {
    super('Invoice upload not found', HttpStatus.NOT_FOUND);
  }
}
