import { ApiProperty } from '@nestjs/swagger';
import { CreatePaymentDto } from './payment.create.dto';
import { IsOptional } from 'class-validator';
import { UpdatePaymentUploadDto } from './payment-upload.update.dto';
import { UpdatePaymentInvoiceEntryDto } from './payment-invoice-entry.update.dto';

export class UpdatePaymentDto extends CreatePaymentDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: UpdatePaymentUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  invoices?: UpdatePaymentInvoiceEntryDto[];
}
