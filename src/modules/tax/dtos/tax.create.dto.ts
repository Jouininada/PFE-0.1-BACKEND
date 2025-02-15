import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateTaxDto {
  @ApiProperty({ example: 'FODEC', type: String })
  @IsString()
  @MinLength(3)
  label: string;

  @ApiProperty({ example: '0.05', type: Number })
  @IsPositive()
  value: number;

  @ApiProperty({ example: 'true', type: Boolean })
  @IsBoolean()
  isRate: boolean;

  @ApiProperty({ example: 'true', type: Boolean })
  @IsBoolean()
  isSpecial: boolean;
}
