import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateInvoiceDto } from './invoice.create.dto';
import { UpdateInvoiceUploadDto } from './invoice-upload.update.dto';

export class UpdateInvoiceDto extends CreateInvoiceDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: UpdateInvoiceUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  amountPaid: number;
}
