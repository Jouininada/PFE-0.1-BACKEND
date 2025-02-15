import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
export class ResponseBankAccountDto {
  @ApiProperty({
    required: false,
    example: faker.datatype.number(),
  })
  id?: number;
  @ApiProperty({
    required: false,
    example: faker.name.firstName(),
  })
  name?: string;

  @ApiProperty({
    required: false,
    example: faker.finance.bic(),
  })
  bic?: string;

  @ApiProperty({
    required: false,
    example: faker.finance.account(20),
  })
  rib?: string;

  @ApiProperty({
    required: false,
    example: faker.finance.iban(),
  })
  iban?: string;

  @ApiProperty({
    required: false,
    example: faker.datatype.number({ min: 1, max: 1000 }),
  })
  currencyId?: number;

  @ApiProperty({
    required: false,
    example: faker.datatype.boolean(),
  })
  isMain?: boolean;
}
