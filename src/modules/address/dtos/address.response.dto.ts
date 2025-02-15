import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ResponseDtoHelper } from 'src/common/database/dtos/database.response.dto';
import { ResponseCountryDto } from 'src/modules/country/dtos/country.response.dto';

export class ResponseAddressDto extends ResponseDtoHelper {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: faker.address.streetAddress(), type: String })
  @IsString()
  address: string;

  @ApiProperty({ example: faker.address.secondaryAddress(), type: String })
  @IsString()
  address2: string;

  @ApiProperty({ example: faker.address.city(), type: String })
  @IsString()
  region: string;

  @ApiProperty({ example: faker.address.zipCode(), type: String })
  @IsString()
  zipcode: string;

  @ApiProperty({ type: () => ResponseCountryDto })
  country: ResponseCountryDto;
}
