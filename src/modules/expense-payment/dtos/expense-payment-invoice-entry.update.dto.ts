import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCreatePaymentInvoiceEntryDto } from './expense-payment-invoice-entry.create.dto';

export class UpdateExpensePaymentInvoiceEntryDto extends ExpenseCreatePaymentInvoiceEntryDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
