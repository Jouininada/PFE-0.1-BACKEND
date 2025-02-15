import { ApiProperty } from '@nestjs/swagger';
import { ResponseDtoHelper } from 'src/common/database/dtos/database.response.dto';

export class ResponseTaxWithholdingDto extends ResponseDtoHelper {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: 'Fees - Reel regime', type: String })
  label: string;

  @ApiProperty({ example: '0.05', type: Number })
  rate: number;
}
