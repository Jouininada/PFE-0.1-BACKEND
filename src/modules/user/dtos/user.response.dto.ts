import { ApiProperty } from '@nestjs/swagger';

export class ResponseUserDto {
  @ApiProperty({ type: Number })
  id?: number;

  @ApiProperty({ type: String })
  username?: string;

  @ApiProperty({ type: String })
  email?: string;

  @ApiProperty({ type: String, required: false })
  firstName?: string;

  @ApiProperty({ type: String, required: false })
  lastName?: string;

  @ApiProperty({ type: String, required: false })
  dateOfBirth?: Date;

  @ApiProperty({ type: String, required: false })
  refreshToken?: string;

  @ApiProperty({ type: Number })
  pictureId?: number;
}
