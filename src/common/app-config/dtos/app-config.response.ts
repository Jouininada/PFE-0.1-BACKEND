import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseAppConfigDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: faker.database.engine(), type: String })
  key: string;

  @ApiProperty({ example: faker.database.engine(), type: Object })
  value: any;
}
