import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseDtoHelper } from 'src/common/database/dtos/database.response.dto';

export class ResponseCurrencyDto extends ResponseDtoHelper {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: faker.finance.currencyName(), type: String })
  label?: string;

  @ApiProperty({
    example: faker.finance.currencyCode(),
    type: Number,
  })
  code?: string;

  @ApiProperty({
    example: faker.finance.currencySymbol(),
    type: Number,
  })
  symbol?: string;

  @ApiProperty({ example: 2, type: Number })
  digitAfterComma: number;
}
