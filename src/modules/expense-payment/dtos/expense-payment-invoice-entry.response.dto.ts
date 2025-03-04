import { ApiProperty } from '@nestjs/swagger';

export class ResponseExpensePaymentInvoiceEntryDto {
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
  expenseInvoiceId?: number;

  @ApiProperty({
    example: '150.0',
    type: Number,
  })
  amount?: number;
}
