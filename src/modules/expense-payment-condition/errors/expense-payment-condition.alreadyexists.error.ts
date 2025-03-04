import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpensePaymentConditionAlreadyExistsException extends HttpException {
  constructor() {
    super('Payment Condition already exists', HttpStatus.CONFLICT);
  }
}
