import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class ResponseFirmInterlocutorEntryDto {
  @ApiProperty({ example: 1, type: Number })
  @IsInt()
  id?: number;

  @ApiProperty({ example: 1, type: Number })
  @IsInt()
  firmId?: number;

  @ApiProperty({ example: 1, type: Number })
  @IsInt()
  interlocutorId?: number;

  @ApiProperty({ example: false, type: Boolean, required: false })
  @IsInt()
  isMain?: boolean;

  @ApiProperty({ example: 'CEO', type: String, required: false })
  @IsString()
  position?: string;
}
