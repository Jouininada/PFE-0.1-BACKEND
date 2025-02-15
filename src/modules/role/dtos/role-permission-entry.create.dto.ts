import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateRolePermissionEntryDto {
  @ApiProperty({ type: Number })
  @IsInt()
  roleId: number;

  @ApiProperty({ type: Number })
  @IsInt()
  permissionId: number;
}
