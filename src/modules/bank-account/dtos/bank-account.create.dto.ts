import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBIC,
  IsBoolean,
  IsIBAN,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateBankAccountDto {
  @ApiProperty({
    required: false,
    example: faker.name.firstName(),
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    required: false,
    example: faker.finance.bic(),
  })
  @IsOptional()
  @IsBIC()
  bic?: string;

  @ApiProperty({
    required: false,
    example: faker.finance.account(20),
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  rib?: string;

  @ApiProperty({
    required: false,
    example: faker.finance.iban(),
  })
  @IsIBAN()
  iban?: string;

  @ApiProperty({
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  currencyId?: number;

  @ApiProperty({
    required: false,
    example: faker.datatype.boolean(),
  })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}
