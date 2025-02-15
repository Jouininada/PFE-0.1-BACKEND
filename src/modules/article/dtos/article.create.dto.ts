import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({ example: faker.commerce.product(), type: String })
  @IsString()
  title: string;

  @ApiProperty({ example: faker.commerce.productDescription(), type: String })
  @IsString()
  description: string;
}
