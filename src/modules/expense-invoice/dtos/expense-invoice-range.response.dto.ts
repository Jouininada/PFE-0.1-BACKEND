import { ApiProperty } from '@nestjs/swagger';
import { ExpenseResponseInvoiceDto } from './expense-invoice.response.dto';

export class ExpenseResponseInvoiceRangeDto {
  @ApiProperty({ type: ExpenseResponseInvoiceDto })
  next: ExpenseResponseInvoiceDto;

  @ApiProperty({ type: ExpenseResponseInvoiceDto })
  previous: ExpenseResponseInvoiceDto;
}