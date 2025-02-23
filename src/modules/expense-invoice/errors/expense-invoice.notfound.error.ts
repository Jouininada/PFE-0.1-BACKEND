import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpenseInvoiceNotFoundException extends HttpException {
  constructor() {
    super('Invoice not found', HttpStatus.NOT_FOUND);
  }
}
