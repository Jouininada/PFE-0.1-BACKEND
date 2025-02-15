import { HttpException, HttpStatus } from '@nestjs/common';

export class TaxWithholdingNotFoundException extends HttpException {
  constructor() {
    super('Tax Withholding not found', HttpStatus.NOT_FOUND);
  }
}
