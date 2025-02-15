import { HttpException, HttpStatus } from '@nestjs/common';

export class DefaultConditionLengthMismatchException extends HttpException {
  constructor() {
    super(
      'Invalid input: IDs and DTOs must both be arrays or both be singular.',
      HttpStatus.BAD_REQUEST,
    );
  }
}
