import { HttpException, HttpStatus } from '@nestjs/common';

export class BankAccountInformationsMismatchException extends HttpException {
  constructor() {
    super('IBAN & RIB does not match is duplicated', HttpStatus.CONFLICT);
  }
}
