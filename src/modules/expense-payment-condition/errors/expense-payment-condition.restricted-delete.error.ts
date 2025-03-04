import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpensePaymentConditionRestrictedDeleteException extends HttpException {
  constructor() {
    super('Payment Condition cannot be deleted', HttpStatus.FORBIDDEN);
  }
}
