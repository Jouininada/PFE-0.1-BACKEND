import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { PAYMENT_MODE } from '../enums/expense-payment-mode.enum';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { CreateExpensePaymentUploadDto } from './expense-payment-upload.create.dto';
import { ExpenseCreatePaymentInvoiceEntryDto } from './expense-payment-invoice-entry.create.dto';


export class ExpenseCreatePaymentDto {
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
  @IsPositive()
  convertionRate?: number;

  @ApiProperty({ example: faker.date.anytime(), type: Date })
  date?: Date;

  @ApiProperty({
    example: PAYMENT_MODE.Cash,
    enum: PAYMENT_MODE,
  })
  @IsEnum(PAYMENT_MODE)
  @IsOptional()
  mode?: PAYMENT_MODE;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  notes?: string;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  currencyId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: CreateExpensePaymentUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  invoices?: ExpenseCreatePaymentInvoiceEntryDto[];
 
  @ApiProperty({
    example: 1,
    type: Number,
  })
  pdfFileId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  sequentialNumbr?: string;


}
