import { ApiProperty } from '@nestjs/swagger';

export class CreateExpensePaymentUploadDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
