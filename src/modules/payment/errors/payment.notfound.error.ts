import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentNotFoundException extends HttpException {
  constructor() {
    super('Payment not found', HttpStatus.NOT_FOUND);
  }
}
