import { ApiProperty } from '@nestjs/swagger';
import { CreateQuotationUploadDto } from './quotation-upload.create.dto';

export class UpdateQuotationUploadDto extends CreateQuotationUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
