import { ApiProperty } from '@nestjs/swagger';
import { CreateExpensePaymentUploadDto } from './expense-payment-upload.create.dto';
import { IsOptional } from 'class-validator';
import { UpdateExpensePaymentUploadDto } from './expense-payment-upload.update.dto';
import { UpdateExpensePaymentInvoiceEntryDto } from './expense-payment-invoice-entry.update.dto';


export class UpdateExpensePaymentDto extends CreateExpensePaymentUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: UpdateExpensePaymentUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  invoices?: UpdateExpensePaymentInvoiceEntryDto[];
}
