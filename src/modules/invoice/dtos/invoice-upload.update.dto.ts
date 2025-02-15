import { ApiProperty } from '@nestjs/swagger';
import { CreateInvoiceUploadDto } from './invoice-upload.create.dto';

export class UpdateInvoiceUploadDto extends CreateInvoiceUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
