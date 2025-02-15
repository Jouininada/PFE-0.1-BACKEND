import { ApiProperty } from '@nestjs/swagger';
import { CreatePaymentInvoiceEntryDto } from './payment-invoice-entry.create.dto';

export class UpdatePaymentInvoiceEntryDto extends CreatePaymentInvoiceEntryDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
