/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { CreateExpensQuotationUploadDto } from './expensquotation-upload.create.dto';

export class UpdateExpensQuotationUploadDto extends CreateExpensQuotationUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
