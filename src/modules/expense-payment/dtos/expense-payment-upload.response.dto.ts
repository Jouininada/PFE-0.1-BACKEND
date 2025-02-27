import { ApiProperty } from '@nestjs/swagger';

export class ResponseExpensePaymentUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  expensePaymentId?: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
