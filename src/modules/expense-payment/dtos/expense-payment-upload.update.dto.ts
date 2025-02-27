import { ApiProperty } from '@nestjs/swagger';
import { CreateExpensePaymentUploadDto } from './expense-payment-upload.create.dto';

export class UpdateExpensePaymentUploadDto extends CreateExpensePaymentUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
