import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @ValidateIf((object, value) => value !== null && value !== undefined)
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  dateOfBirth?: Date;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  refreshToken?: string;

  @ApiProperty({ type: Number })
  @IsOptional()
  @IsInt()
  pictureId?: number;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
