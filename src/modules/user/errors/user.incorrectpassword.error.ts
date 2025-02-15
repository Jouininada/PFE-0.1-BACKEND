import { HttpException, HttpStatus } from '@nestjs/common';

export class UserIncorrectPasswordException extends HttpException {
  constructor() {
    super('Incorrect Password', HttpStatus.UNAUTHORIZED);
  }
}
