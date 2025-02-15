import { HttpException, HttpStatus } from '@nestjs/common';

export class BankAccountAlreadyExistsException extends HttpException {
  constructor() {
    super('Bank Account already exists', HttpStatus.CONFLICT);
  }
}
