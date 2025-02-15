/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { UpdateExpensQuotationUploadDto } from './expensquotation-upload.update.dto';
import { IsOptional } from 'class-validator';
import { CreateExpensQuotationDto } from './expensquotation.create.dto';

export class UpdateExpensQuotationDto extends CreateExpensQuotationDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: UpdateExpensQuotationUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  createInvoice: boolean;
}
