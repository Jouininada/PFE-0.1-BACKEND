import { ApiProperty } from '@nestjs/swagger';
import { IsPositive, IsString, MinLength } from 'class-validator';

export class CreateTaxWithholdingDto {
  @ApiProperty({ example: 'Fees - Reel regime', type: String })
  @IsString()
  @MinLength(3)
  label: string;

  @ApiProperty({ example: '0.05', type: Number })
  @IsPositive()
  rate: number;
}
