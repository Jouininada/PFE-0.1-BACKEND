import { HttpException, HttpStatus } from '@nestjs/common';

export class DefaultConditionNotFoundException extends HttpException {
  constructor() {
    super('Default Condition not found', HttpStatus.NOT_FOUND);
  }
}
