import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseDtoHelper } from 'src/common/database/dtos/database.response.dto';

export class ResponsePaymentConditionDto extends ResponseDtoHelper {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: faker.finance.transactionType(), type: String })
  label: string;

  @ApiProperty({
    example: faker.definitions.company.descriptor[0],
    type: String,
  })
  description: string;
}
