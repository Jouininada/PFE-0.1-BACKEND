import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ type: String })
  @MinLength(3)
  @IsString()
  label: string;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
