import { ApiProperty } from '@nestjs/swagger';
import { CreatePaymentUploadDto } from './payment-upload.create.dto';

export class UpdatePaymentUploadDto extends CreatePaymentUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
