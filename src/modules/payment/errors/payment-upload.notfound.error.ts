import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentUploadNotFoundException extends HttpException {
  constructor() {
    super('Payment upload not found', HttpStatus.NOT_FOUND);
  }
}
