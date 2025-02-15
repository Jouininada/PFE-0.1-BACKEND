import { HttpException, HttpStatus } from '@nestjs/common';

export class QuotationSequentialNotFoundException extends HttpException {
  constructor() {
    super('Cannot get Quotation Sequential Number', HttpStatus.NOT_FOUND);
  }
}
