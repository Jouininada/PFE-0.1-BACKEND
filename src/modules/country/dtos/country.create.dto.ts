import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  @IsInt()
  id: number;

  @ApiProperty({ example: 'TN', type: String })
  @IsString()
  @MinLength(2)
  alpha2code: string;

  @ApiProperty({ example: 'TUN', type: String })
  @IsString()
  @MinLength(3)
  alpha3code: string;
}
