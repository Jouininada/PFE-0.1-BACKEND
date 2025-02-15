import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentConditionNotFoundException extends HttpException {
  constructor() {
    super('Payment Condition not found', HttpStatus.NOT_FOUND);
  }
}
