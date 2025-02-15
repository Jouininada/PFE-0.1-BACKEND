/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { DATE_FORMAT } from 'src/app/enums/date-formats.enum';

export class UpdateExpensQuotationSequenceDto {
  @ApiProperty({ example: 'EST', type: String })
  @IsOptional()
  prefix: string;

  @ApiProperty({ enum: DATE_FORMAT, example: DATE_FORMAT.yy_MM })
  @IsOptional()
  dynamic_sequence: DATE_FORMAT;

  @ApiProperty({ example: 'EST', type: String })
  @IsOptional()
  @IsNumber()
  next: number;
}
