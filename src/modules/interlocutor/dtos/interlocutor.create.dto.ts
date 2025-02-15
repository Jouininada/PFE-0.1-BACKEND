import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { SOCIAL_TITLES } from 'src/app/enums/social-titles.enum';
import { CreateFirmInterlocutorEntryDto } from 'src/modules/firm-interlocutor-entry/dtos/firm-interlocutor-entry.create.dto';

export class CreateInterlocutorDto {
  @ApiProperty({ example: SOCIAL_TITLES.MR, enum: SOCIAL_TITLES })
  @IsEnum(SOCIAL_TITLES)
  title: SOCIAL_TITLES;

  @ApiProperty({ example: faker.person.firstName(), type: String })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: faker.person.lastName(), type: String })
  @IsString()
  @MinLength(3)
  surname: string;

  @ApiProperty({ example: faker.phone.number(), type: String })
  @IsString()
  phone: string;

  @ApiProperty({ example: faker.internet.email(), type: String })
  @IsString()
  email: string;

  @ApiProperty({ example: faker.internet.email(), type: String })
  @IsOptional()
  @IsString()
  position: string;

  @ApiProperty({ type: () => CreateFirmInterlocutorEntryDto, isArray: true })
  @IsOptional()
  firmsToInterlocutor?: CreateFirmInterlocutorEntryDto[];
}
