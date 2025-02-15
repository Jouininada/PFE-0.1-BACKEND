import { HttpException, HttpStatus } from '@nestjs/common';

export class ActivityNotFoundException extends HttpException {
  constructor() {
    super('Activity not found', HttpStatus.NOT_FOUND);
  }
}
