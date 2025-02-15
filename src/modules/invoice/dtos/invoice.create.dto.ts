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
import { INVOICE_STATUS } from '../enums/invoice-status.enum';
import { CreateArticleInvoiceEntryDto } from './article-invoice-entry.create.dto';
import { CreateInvoiceMetaDataDto } from './invoice-meta-data.create.dto';
import { CreateInvoiceUploadDto } from './invoice-upload.create.dto';

export class CreateInvoiceDto {
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
    example: INVOICE_STATUS.Unpaid,
    enum: INVOICE_STATUS,
  })
  @IsOptional()
  @IsEnum(INVOICE_STATUS)
  status?: INVOICE_STATUS;

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

  @ApiProperty({ type: () => CreateArticleInvoiceEntryDto, isArray: true })
  @IsOptional()
  articleInvoiceEntries?: CreateArticleInvoiceEntryDto[];

  @ApiProperty({ type: () => CreateInvoiceMetaDataDto })
  @IsOptional()
  invoiceMetaData?: CreateInvoiceMetaDataDto;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: CreateInvoiceUploadDto[];

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
