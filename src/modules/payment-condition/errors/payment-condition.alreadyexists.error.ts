import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentConditionAlreadyExistsException extends HttpException {
  constructor() {
    super('Payment Condition already exists', HttpStatus.CONFLICT);
  }
}
