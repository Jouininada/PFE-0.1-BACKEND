/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateExpensQuotationUploadDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
