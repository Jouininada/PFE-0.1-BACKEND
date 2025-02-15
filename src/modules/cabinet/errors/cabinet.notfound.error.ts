import { HttpException, HttpStatus } from '@nestjs/common';

export class CabinetNotFoundException extends HttpException {
  constructor() {
    super('Cabinet not found', HttpStatus.NOT_FOUND);
  }
}
