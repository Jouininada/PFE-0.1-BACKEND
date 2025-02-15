import { HttpException, HttpStatus } from '@nestjs/common';

export class InterlocutorAlreadyExistsException extends HttpException {
  constructor() {
    super('Interlocutor already exists', HttpStatus.CONFLICT);
  }
}
