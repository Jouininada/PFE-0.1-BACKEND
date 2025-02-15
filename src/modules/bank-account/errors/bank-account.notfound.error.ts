import { HttpException, HttpStatus } from '@nestjs/common';

export class BankAccountNotFoundException extends HttpException {
  constructor() {
    super('Bank Account not found', HttpStatus.NOT_FOUND);
  }
}
