import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentInvoiceEntryNotFoundException extends HttpException {
  constructor() {
    super('Payment Invoice Entry not found', HttpStatus.NOT_FOUND);
  }
}
