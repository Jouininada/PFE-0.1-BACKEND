import { HttpException, HttpStatus } from '@nestjs/common';

export class AppConfigAlreadyExistsException extends HttpException {
  constructor() {
    super('App Config already exists', HttpStatus.CONFLICT);
  }
}
