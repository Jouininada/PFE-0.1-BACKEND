import { HttpException, HttpStatus } from '@nestjs/common';

export class BankAccountCannotBeDeletedException extends HttpException {
  constructor() {
    super('Bank Account cannot be deleted', HttpStatus.FORBIDDEN);
  }
}
