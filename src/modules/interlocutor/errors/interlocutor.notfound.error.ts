import { HttpException, HttpStatus } from '@nestjs/common';

export class InterlocutorNotFoundException extends HttpException {
  constructor() {
    super('Interlocutor not found', HttpStatus.NOT_FOUND);
  }
}
