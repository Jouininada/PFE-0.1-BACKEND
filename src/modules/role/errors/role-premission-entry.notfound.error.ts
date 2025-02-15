import { HttpException, HttpStatus } from '@nestjs/common';

export class RolePermissionEntryNotFoundException extends HttpException {
  constructor() {
    super('Role Permission Entry not found', HttpStatus.NOT_FOUND);
  }
}
