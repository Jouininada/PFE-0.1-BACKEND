import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCreateInvoiceUploadDto } from './expense-invoice-upload.create.dto';

export class ExpenseUpdateInvoiceUploadDto extends ExpenseCreateInvoiceUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}