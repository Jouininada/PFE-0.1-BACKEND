import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpensePaymentNotFoundException extends HttpException {
  constructor() {
    super('Expense Payment not found', HttpStatus.NOT_FOUND);
  }
}
