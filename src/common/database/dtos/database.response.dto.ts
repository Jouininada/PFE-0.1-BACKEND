import { ApiProperty } from '@nestjs/swagger';

import {
  DATABASE_CREATED_AT_FIELD_NAME,
  DATABASE_DELETED_AT_FIELD_NAME,
  DATABASE_UPDATED_AT_FIELD_NAME,
} from 'src/common/database/constants/database.constant';

export abstract class ResponseDtoHelper {
  @ApiProperty({ type: Date })
  [DATABASE_DELETED_AT_FIELD_NAME]?: Date;

  @ApiProperty({ type: Date })
  [DATABASE_CREATED_AT_FIELD_NAME]?: Date;

  @ApiProperty({ type: Date })
  [DATABASE_UPDATED_AT_FIELD_NAME]?: Date;
}
