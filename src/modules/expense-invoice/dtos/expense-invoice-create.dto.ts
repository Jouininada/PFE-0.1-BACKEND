import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { EXPENSE_INVOICE_STATUS } from '../enums/expense-invoice-status.enum';
import { ExpenseCreateArticleInvoiceEntryDto } from './expense-article-invoice-entry.create.dto';
import { ExpenseCreateInvoiceMetaDataDto } from './expense-invoice-meta-data.create.dtos';
import { ExpenseCreateInvoiceUploadDto } from './expense-invoice-upload.create.dto';

export class ExpenseCreateInvoiceDto {
  @ApiProperty({ example: faker.date.anytime() })
  date?: Date;

  @ApiProperty({ example: faker.date.anytime() })
  dueDate?: Date;

  @ApiProperty({
    example: faker.finance.transactionDescription(),
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  object?: string;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  generalConditions?: string;

  @ApiProperty({
    example: EXPENSE_INVOICE_STATUS.Unpaid,
    enum: EXPENSE_INVOICE_STATUS,
  })
  @IsOptional()
  @IsEnum(EXPENSE_INVOICE_STATUS)
  status?: EXPENSE_INVOICE_STATUS;

  @ApiProperty({
    example: '0.1',
    type: Number,
  })
  @IsOptional()
  discount?: number;

  @ApiProperty({ example: DISCOUNT_TYPES.PERCENTAGE, enum: DISCOUNT_TYPES })
  @IsOptional()
  @IsEnum(DISCOUNT_TYPES)
  discount_type?: DISCOUNT_TYPES;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  currencyId?: number;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  bankAccountId?: number;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  firmId?: number;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  interlocutorId?: number;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  notes?: string;

  @ApiProperty({ type: () => ExpenseCreateArticleInvoiceEntryDto, isArray: true })
  @IsOptional()
  articleInvoiceEntries?: ExpenseCreateArticleInvoiceEntryDto[];

  @ApiProperty({ type: () => ExpenseCreateInvoiceMetaDataDto })
  @IsOptional()
  invoiceMetaData?: ExpenseCreateInvoiceMetaDataDto;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: ExpenseCreateInvoiceUploadDto[];

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  quotationId?: number;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  taxStampId?: number;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  taxWithholdingId?: number;
}
