import { ApiProperty } from '@nestjs/swagger';

export class ResponsePermissionDto {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  label?: string;

  @ApiProperty({
    type: String,
  })
  description?: string;
}
