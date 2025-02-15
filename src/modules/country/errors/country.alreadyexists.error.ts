import { HttpException, HttpStatus } from '@nestjs/common';

export class CountryAlreadyExistsException extends HttpException {
  constructor() {
    super('Country already exists', HttpStatus.CONFLICT);
  }
}
