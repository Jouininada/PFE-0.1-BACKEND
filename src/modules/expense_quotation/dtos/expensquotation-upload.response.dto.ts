/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class ResponseExpensQuotationUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  expenseQuotationId?: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
