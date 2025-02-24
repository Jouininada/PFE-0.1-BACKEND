import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpensePaymentUploadNotFoundException extends HttpException {
  constructor() {
    super('Expense Payment upload not found', HttpStatus.NOT_FOUND);
  }
}
