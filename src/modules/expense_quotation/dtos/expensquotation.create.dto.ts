/* eslint-disable prettier/prettier */
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
import { CreateArticleQuotationEntryDto } from 'src/modules/quotation/dtos/article-quotation-entry.create.dto';
import { EXPENSQUOTATION_STATUS } from '../enums/expensquotation-status.enum';
import { CreateExpensQuotationMetaDataDto } from './expensquotation-meta-data.create.dto';
import { CreateExpensQuotationUploadDto } from './expensquotation-upload.create.dto';
import { CreateArticleExpensQuotationEntryDto } from './article-expensquotation-entry.create.dto';

export class CreateExpensQuotationDto {
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
    example: EXPENSQUOTATION_STATUS.Draft,
    enum: EXPENSQUOTATION_STATUS,
  })
  @IsOptional()
  @IsEnum(EXPENSQUOTATION_STATUS)
  status?: EXPENSQUOTATION_STATUS;

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

  @ApiProperty({ type: () => CreateArticleExpensQuotationEntryDto, isArray: true })
  @IsOptional()
  articleQuotationEntries?: CreateArticleExpensQuotationEntryDto[];

  @ApiProperty({ type: () => CreateExpensQuotationMetaDataDto })
  @IsOptional()
  expenseMetaDataId?: number; // Referring to expense_quotation_meta_data.id

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: CreateExpensQuotationUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  invoiceId?: number;

  @ApiProperty({ type: () => CreateExpensQuotationMetaDataDto })
  @IsOptional()
  expensequotationMetaData?: CreateExpensQuotationMetaDataDto;
}
