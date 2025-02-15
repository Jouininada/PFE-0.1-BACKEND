import { HttpException, HttpStatus } from '@nestjs/common';

export class AppConfigNotFoundException extends HttpException {
  constructor() {
    super('App Config not found', HttpStatus.NOT_FOUND);
  }
}
