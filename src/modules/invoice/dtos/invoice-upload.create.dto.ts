import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceUploadDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
