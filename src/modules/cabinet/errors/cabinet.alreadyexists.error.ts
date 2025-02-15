import { HttpException, HttpStatus } from '@nestjs/common';

export class EnterpriseNameAlreadyExistsException extends HttpException {
  constructor() {
    super('Enterprise name is already taken', HttpStatus.CONFLICT);
  }
}

export class TaxIdNumberDuplicateException extends HttpException {
  constructor() {
    super('Tax ID number is duplicated', HttpStatus.CONFLICT);
  }
}
