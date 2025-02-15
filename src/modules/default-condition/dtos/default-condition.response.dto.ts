import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { ACTIVITY_TYPE } from 'src/app/enums/activity-types.enum';
import { DOCUMENT_TYPE } from 'src/app/enums/document-types.enum';

export class ResponseDefaultConditionDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({
    example: DOCUMENT_TYPE.INVOICE,
    enum: DOCUMENT_TYPE,
    required: false,
  })
  document_type?: DOCUMENT_TYPE;

  @ApiProperty({
    example: ACTIVITY_TYPE.SELLING,
    enum: ACTIVITY_TYPE,
    required: false,
  })
  activity_type?: ACTIVITY_TYPE;

  @ApiProperty({ example: faker.company.buzzPhrase(), type: String })
  value: string;
}
