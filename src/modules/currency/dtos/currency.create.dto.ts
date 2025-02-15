import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  IsInt,
} from 'class-validator';

export class CreateCurrencyDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  @IsInt()
  id: number;

  @ApiProperty({ example: faker.finance.currencyName(), type: String })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  label?: string;

  @ApiProperty({
    example: faker.finance.currencyCode(),
    type: Number,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  code?: string;

  @ApiProperty({
    example: faker.finance.currencySymbol(),
    type: Number,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  symbol?: string;

  @ApiProperty({ example: 2, type: Number })
  @IsInt()
  digitAfterComma: number;
}
