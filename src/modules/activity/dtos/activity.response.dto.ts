import { ApiProperty } from '@nestjs/swagger';
import { ResponseDtoHelper } from 'src/common/database/dtos/database.response.dto';

export class ResponseActivityDto extends ResponseDtoHelper {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: 'Service', type: String })
  label: string;
}
