import { ApiProperty } from '@nestjs/swagger';

export class CreateQuotationUploadDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
