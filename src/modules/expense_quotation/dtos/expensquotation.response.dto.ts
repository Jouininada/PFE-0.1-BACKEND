/* eslint-disable prettier/prettier */
import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { ResponseArticleQuotationEntryDto } from 'src/modules/quotation/dtos/article-quotation-entry.response.dto';
import { ResponseFirmDto } from 'src/modules/firm/dtos/firm.response.dto';
import { ResponseInterlocutorDto } from 'src/modules/interlocutor/dtos/interlocutor.response.dto';
import { EXPENSQUOTATION_STATUS } from '../enums/expensquotation-status.enum';
import { ResponseCabinetDto } from 'src/modules/cabinet/dtos/cabinet.response.dto';
import { ResponseExpensQuotationMetaDataDto } from './expensquotation-meta-data.response.dto';
import { ResponseCurrencyDto } from 'src/modules/currency/dtos/currency.response.dto';
import { ResponseBankAccountDto } from 'src/modules/bank-account/dtos/bank-account.response.dto';
import { ResponseExpensQuotationUploadDto } from './expensquotation-upload.response.dto';

export class ResponseExpensQuotationDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({
    example: faker.finance.transactionDescription(),
    type: String,
  })
  sequential: string;

  @ApiProperty({ example: faker.date.anytime(), type: Date })
  date?: Date;

  @ApiProperty({ example: faker.date.anytime(), type: Date })
  dueDate?: Date;

  @ApiProperty({
    example: faker.finance.transactionDescription(),
    type: String,
  })
  object?: string;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  generalConditions?: string;

  @ApiProperty({
    example: EXPENSQUOTATION_STATUS.Draft,
    enum: EXPENSQUOTATION_STATUS,
  })
  status?: EXPENSQUOTATION_STATUS;

  @ApiProperty({
    example: '0.1',
    type: Number,
  })
  discount?: number;

  @ApiProperty({ example: DISCOUNT_TYPES.PERCENTAGE, enum: DISCOUNT_TYPES })
  discount_type: DISCOUNT_TYPES;

  @ApiProperty({
    example: '125.35',
    type: Number,
  })
  subTotal?: number;

  @ApiProperty({
    example: '150.0',
    type: Number,
  })
  total?: number;

  @ApiProperty({ type: () => ResponseCurrencyDto })
  currency?: ResponseCurrencyDto;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  currencyId?: number;

  @ApiProperty({ type: () => ResponseBankAccountDto })
  bankAccount?: ResponseBankAccountDto;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  bankAccountId?: number;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  firmId?: number;

  @ApiProperty({ type: () => ResponseFirmDto })
  firm?: ResponseFirmDto;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  interlocutorId?: number;

  @ApiProperty({ type: () => ResponseInterlocutorDto })
  interlocutor?: ResponseInterlocutorDto;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  cabinetId?: number;

  @ApiProperty({ type: () => ResponseFirmDto })
  cabinet?: ResponseCabinetDto;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  notes?: string;

  @ApiProperty({ type: () => ResponseArticleQuotationEntryDto, isArray: true })
  articleQuotationEntries?: ResponseArticleQuotationEntryDto[];

  @ApiProperty({ type: () => ResponseExpensQuotationMetaDataDto })
  quotationMetaData?: ResponseExpensQuotationMetaDataDto;

  @ApiProperty({ required: false })
  uploads?: ResponseExpensQuotationUploadDto[];

  @ApiProperty({ required: false })
  invoiceId?: number;
}
