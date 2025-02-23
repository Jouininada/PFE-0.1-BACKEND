
import { ApiProperty } from '@nestjs/swagger';

export class ExpenseCreateInvoiceUploadDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
