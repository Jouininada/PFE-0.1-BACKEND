import { ApiProperty } from '@nestjs/swagger';

export class UpdateAppConfigDto {
  @ApiProperty({ example: {}, type: Object })
  value: any;
}
