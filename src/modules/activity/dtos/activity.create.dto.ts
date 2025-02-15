import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateActivityDto {
  @ApiProperty({ example: faker.company.buzzPhrase(), type: String })
  @IsString()
  @MinLength(3)
  label: string;
}
