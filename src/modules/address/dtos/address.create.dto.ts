import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateAddressDto {
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

  @ApiProperty({ example: 1, type: Number })
  @IsInt()
  countryId: number;
}
