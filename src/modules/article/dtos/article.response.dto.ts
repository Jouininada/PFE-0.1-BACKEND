import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ResponseArticleDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ example: faker.commerce.product(), type: String })
  @IsString()
  title: string;

  @ApiProperty({ example: faker.commerce.productDescription(), type: String })
  @IsString()
  description: string;
}
