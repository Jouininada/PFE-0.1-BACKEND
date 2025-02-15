import { ApiProperty } from '@nestjs/swagger';

export class ResponseRefreshTokenDto {
  @ApiProperty({
    type: Number,
  })
  userId: number;

  @ApiProperty({
    type: String,
  })
  refreshToken: string;
}
