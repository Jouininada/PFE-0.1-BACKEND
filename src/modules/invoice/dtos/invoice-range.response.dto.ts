import { ApiProperty } from '@nestjs/swagger';
import { ResponseInvoiceDto } from './invoice.response.dto';

export class ResponseInvoiceRangeDto {
  @ApiProperty({ type: ResponseInvoiceDto })
  next: ResponseInvoiceDto;

  @ApiProperty({ type: ResponseInvoiceDto })
  previous: ResponseInvoiceDto;
}
