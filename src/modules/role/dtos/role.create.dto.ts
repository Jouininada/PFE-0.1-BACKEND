import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRoleDto {
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

  @ApiProperty({
    type: Array<number>,
  })
  @IsOptional()
  permissionsIds?: number[];
}
