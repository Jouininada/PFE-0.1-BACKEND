import { HttpException, HttpStatus } from '@nestjs/common';

export class FirmNotFoundException extends HttpException {
  constructor() {
    super('Firm not found', HttpStatus.NOT_FOUND);
  }
}
