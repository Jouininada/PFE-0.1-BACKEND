import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ACTIVITY_TYPE } from 'src/app/enums/activity-types.enum';
import { DOCUMENT_TYPE } from 'src/app/enums/document-types.enum';

export class CreateDefaultConditionDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({
    example: DOCUMENT_TYPE.INVOICE,
    enum: DOCUMENT_TYPE,
    required: false,
  })
  @IsOptional()
  @IsEnum(DOCUMENT_TYPE)
  document_type?: DOCUMENT_TYPE;

  @ApiProperty({
    example: ACTIVITY_TYPE.SELLING,
    enum: ACTIVITY_TYPE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ACTIVITY_TYPE)
  activity_type?: ACTIVITY_TYPE;

  @ApiProperty({ example: faker.company.buzzPhrase(), type: String })
  value: string;
}
