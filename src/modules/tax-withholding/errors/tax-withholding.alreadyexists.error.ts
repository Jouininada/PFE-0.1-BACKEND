import { HttpException, HttpStatus } from '@nestjs/common';

export class TaxWithholdingAlreadyExistsException extends HttpException {
  constructor() {
    super('Tax Withholding already exists', HttpStatus.CONFLICT);
  }
}
