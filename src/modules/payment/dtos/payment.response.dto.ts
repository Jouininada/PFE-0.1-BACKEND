import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { PAYMENT_MODE } from '../enums/payment-mode.enum';
import { ResponsePaymentUploadDto } from './payment-upload.response.dto';
import { ResponsePaymentInvoiceEntryDto } from './payment-invoice-entry.response.dto';

export class ResponsePaymentDto {
  @ApiProperty({ example: 1, type: Number })
  id?: number;

  @ApiProperty({
    example: '150.0',
    type: Number,
  })
  amount?: number;

  @ApiProperty({
    example: '15.0',
    type: Number,
  })
  fee?: number;

  @ApiProperty({
    example: '150.0',
    type: Number,
  })
  convertionRate?: number;

  @ApiProperty({ example: faker.date.anytime(), type: Date })
  date?: Date;

  @ApiProperty({
    example: PAYMENT_MODE.Cash,
    enum: PAYMENT_MODE,
  })
  mode?: PAYMENT_MODE;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  notes?: string;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  currencyId?: number;

  @ApiProperty({ required: false })
  uploads?: ResponsePaymentUploadDto[];

  @ApiProperty({ required: false })
  invoices?: ResponsePaymentInvoiceEntryDto[];
}
