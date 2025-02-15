import { ApiProperty } from '@nestjs/swagger';
import { UpdateQuotationUploadDto } from './quotation-upload.update.dto';
import { IsOptional } from 'class-validator';
import { CreateQuotationDto } from './quotation.create.dto';

export class UpdateQuotationDto extends CreateQuotationDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: UpdateQuotationUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  createInvoice: boolean;
}
