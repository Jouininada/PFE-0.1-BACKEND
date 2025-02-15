import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ type: String })
  @IsString()
  username: string;

  @ApiProperty({ type: String })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  dateOfBirth?: Date;

  @ApiProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  roleId?: number;

  @ApiProperty({ type: Number })
  @IsOptional()
  @IsInt()
  pictureId?: number;
}
