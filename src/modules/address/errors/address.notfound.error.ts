import { HttpException, HttpStatus } from '@nestjs/common';

export class AddressNotFoundException extends HttpException {
  constructor() {
    super('Address not found', HttpStatus.NOT_FOUND);
  }
}
