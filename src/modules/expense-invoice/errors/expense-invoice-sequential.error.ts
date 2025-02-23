import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpenseInvoiceSequentialNotFoundException extends HttpException {
  constructor() {
    super('Cannot get Invoice Sequential Number', HttpStatus.NOT_FOUND);
  }
}