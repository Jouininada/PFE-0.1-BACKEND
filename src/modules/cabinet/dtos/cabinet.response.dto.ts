import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseDtoHelper } from 'src/common/database/dtos/database.response.dto';
import { ResponseActivityDto } from 'src/modules/activity/dtos/activity.response.dto';
import { ResponseAddressDto } from 'src/modules/address/dtos/address.response.dto';
import { ResponseCurrencyDto } from 'src/modules/currency/dtos/currency.response.dto';

export class ResponseCabinetDto extends ResponseDtoHelper {
  @ApiProperty({ example: faker.company.name(), type: String })
  enterpriseName?: string;

  @ApiProperty({ example: faker.internet.email(), type: String })
  email?: string;

  @ApiProperty({ example: faker.phone.number(), type: String })
  phone?: string;

  @ApiProperty({ example: faker.finance.routingNumber(), type: String })
  taxIdNumber?: string;

  @ApiProperty({ type: () => ResponseAddressDto, nullable: true })
  address?: ResponseAddressDto;

  @ApiProperty({ type: () => ResponseActivityDto, nullable: true })
  activity?: ResponseActivityDto;

  @ApiProperty({ type: () => ResponseCurrencyDto, nullable: true })
  currency?: ResponseCurrencyDto;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  logoId?: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  signatureId?: number;
}
