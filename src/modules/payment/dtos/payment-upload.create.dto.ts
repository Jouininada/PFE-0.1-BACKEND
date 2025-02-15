import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentUploadDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
