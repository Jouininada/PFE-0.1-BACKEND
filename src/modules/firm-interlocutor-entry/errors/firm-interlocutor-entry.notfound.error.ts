import { HttpException, HttpStatus } from '@nestjs/common';

export class FirmInterlocutorEntryNotFoundException extends HttpException {
  constructor() {
    super('Firm Interlocutor Entry not found', HttpStatus.NOT_FOUND);
  }
}
