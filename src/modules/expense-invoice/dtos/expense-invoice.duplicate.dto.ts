import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ExpenseDuplicateInvoiceDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: true, type: Boolean })
  @IsBoolean()
  @IsOptional()
  includeFiles?: boolean;
}
