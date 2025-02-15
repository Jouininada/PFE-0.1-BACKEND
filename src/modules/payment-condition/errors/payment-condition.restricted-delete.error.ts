import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentConditionRestrictedDeleteException extends HttpException {
  constructor() {
    super('Payment Condition cannot be deleted', HttpStatus.FORBIDDEN);
  }
}
