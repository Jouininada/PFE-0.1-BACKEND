import { HttpException, HttpStatus } from '@nestjs/common';

export class FirmAlreadyExistsException extends HttpException {
  constructor() {
    super('firm_name_already_taken', HttpStatus.CONFLICT);
  }
}

export class TaxIdNumberDuplicateException extends HttpException {
  constructor() {
    super('tax_number_already_taken', HttpStatus.CONFLICT);
  }
}
