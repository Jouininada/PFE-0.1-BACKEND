import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpensePaymentConditionNotFoundException extends HttpException {
  constructor() {
    super('Payment Condition not found', HttpStatus.NOT_FOUND);
  }
}
