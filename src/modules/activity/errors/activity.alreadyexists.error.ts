import { HttpException, HttpStatus } from '@nestjs/common';

export class ActivityAlreadyExistsException extends HttpException {
  constructor() {
    super('Activity already exists', HttpStatus.CONFLICT);
  }
}
