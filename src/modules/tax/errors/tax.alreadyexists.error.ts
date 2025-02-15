import { HttpException, HttpStatus } from '@nestjs/common';

export class TaxAlreadyExistsException extends HttpException {
  constructor() {
    super('Tax already exists', HttpStatus.CONFLICT);
  }
}
