import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateFirmInterlocutorEntryDto {
  @ApiProperty({ example: 1, type: Number })
  @IsInt()
  firmId?: number;

  @ApiProperty({ example: 1, type: Number })
  @IsInt()
  interlocutorId?: number;

  @ApiProperty({ example: false, type: Boolean, required: false })
  @IsOptional()
  isMain?: boolean;

  @ApiProperty({ example: 'CEO', type: String, required: false })
  @IsOptional()
  @IsString()
  position?: string;
}
