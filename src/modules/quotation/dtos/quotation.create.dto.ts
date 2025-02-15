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
import { QUOTATION_STATUS } from '../enums/quotation-status.enum';
import { CreateQuotationMetaDataDto } from './quotation-meta-data.create.dto';
import { CreateQuotationUploadDto } from './quotation-upload.create.dto';

export class CreateQuotationDto {
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
    example: QUOTATION_STATUS.Draft,
    enum: QUOTATION_STATUS,
  })
  @IsOptional()
  @IsEnum(QUOTATION_STATUS)
  status?: QUOTATION_STATUS;

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

  @ApiProperty({ type: () => CreateArticleQuotationEntryDto, isArray: true })
  @IsOptional()
  articleQuotationEntries?: CreateArticleQuotationEntryDto[];

  @ApiProperty({ type: () => CreateQuotationMetaDataDto })
  @IsOptional()
  quotationMetaData?: CreateQuotationMetaDataDto;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: CreateQuotationUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  invoiceId?: number;
}
