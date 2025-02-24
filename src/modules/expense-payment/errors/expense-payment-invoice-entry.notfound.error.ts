import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpensePaymentInvoiceEntryNotFoundException extends HttpException {
  constructor() {
    super('Expense Payment Invoice Entry not found', HttpStatus.NOT_FOUND);
  }
}
