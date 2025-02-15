import { HttpException, HttpStatus } from '@nestjs/common';

export class TaxNotFoundException extends HttpException {
  constructor() {
    super('Tax not found', HttpStatus.NOT_FOUND);
  }
}
