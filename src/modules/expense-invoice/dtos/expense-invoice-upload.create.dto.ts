
import { ApiProperty } from '@nestjs/swagger';

export class ExpenseCreateInvoiceUploadDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;

   @ApiProperty({
    example: 1,
    type: Number,
  })
  filePath?: number;
}
