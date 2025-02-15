import { ApiProperty } from '@nestjs/swagger';
import { ResponseDtoHelper } from 'src/common/database/dtos/database.response.dto';

export class ResponseTaxDto extends ResponseDtoHelper {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: 'FODEC', type: String })
  label: string;

  @ApiProperty({ example: '0.05', type: Number })
  value: number;

  @ApiProperty({ example: 'true', type: Boolean })
  isRate: boolean;

  @ApiProperty({ example: 'true', type: Boolean })
  isSpecial: boolean;
}
