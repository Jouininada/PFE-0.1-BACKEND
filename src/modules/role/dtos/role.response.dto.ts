import { ApiProperty } from '@nestjs/swagger';
import { ResponsePermissionDto } from 'src/modules/permission/dtos/permission.response.dto';

export class ResponseRoleDto {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  label?: string;

  @ApiProperty({
    type: String,
  })
  description?: string;

  @ApiProperty({ type: Array<ResponsePermissionDto> })
  permissions?: ResponsePermissionDto[];
}
