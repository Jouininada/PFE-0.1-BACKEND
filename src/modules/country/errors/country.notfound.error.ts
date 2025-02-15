import { HttpException, HttpStatus } from '@nestjs/common';

export class CountryNotFoundException extends HttpException {
  constructor() {
    super('Country not found', HttpStatus.NOT_FOUND);
  }
}
