import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseDtoHelper } from 'src/common/database/dtos/database.response.dto';
import { ResponseActivityDto } from 'src/modules/activity/dtos/activity.response.dto';
import { ResponseAddressDto } from 'src/modules/address/dtos/address.response.dto';
import { ResponseCabinetDto } from 'src/modules/cabinet/dtos/cabinet.response.dto';
import { ResponseCurrencyDto } from 'src/modules/currency/dtos/currency.response.dto';
import { ResponseFirmInterlocutorEntryDto } from 'src/modules/firm-interlocutor-entry/dtos/firm-interlocutor-entry.response.dto';
import { ResponsePaymentConditionDto } from 'src/modules/payment-condition/dtos/payment-condition.response.dto';

export class ResponseFirmDto extends ResponseDtoHelper {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: faker.company.name() })
  name: string;

  @ApiProperty({
    example: `https://www.${faker.company.name()}.com`,
    type: String,
  })
  website?: string;

  @ApiProperty({ example: faker.phone.number(), type: String })
  phone: string;

  @ApiProperty({
    example: 'Notes',
    type: String,
  })
  notes?: string;

  @ApiProperty({ example: true })
  isPerson: boolean;

  @ApiProperty({ example: faker.finance.routingNumber(), type: String })
  taxIdNumber?: string;

  @ApiProperty({ type: () => ResponseActivityDto, nullable: true })
  activity?: ResponseActivityDto;

  @ApiProperty({ example: 1, nullable: true })
  activityId?: number;

  @ApiProperty({ type: () => ResponseCurrencyDto, nullable: true })
  currency?: ResponseCurrencyDto;

  @ApiProperty({ example: 1, nullable: true })
  currencyId?: number;

  @ApiProperty({ type: () => ResponsePaymentConditionDto, nullable: true })
  paymentCondition?: ResponsePaymentConditionDto;

  @ApiProperty({ example: 1, type: Number })
  paymentConditionId?: number;

  @ApiProperty({ type: () => ResponseAddressDto, nullable: true })
  invoicingAddress?: ResponseAddressDto;

  @ApiProperty({ example: 1, nullable: true })
  invoicingAddressId?: number;

  @ApiProperty({ type: () => ResponseAddressDto, nullable: true })
  deliveryAddress?: ResponseAddressDto;

  @ApiProperty({ example: 1, nullable: true })
  deliveryAddressId?: number;

  @ApiProperty({ type: () => ResponseCabinetDto, nullable: true })
  cabinet?: ResponseCabinetDto;

  @ApiProperty({ example: 1, nullable: true })
  cabinetId?: number;

  @ApiProperty({ type: Array })
  interlocutorsToFirm: ResponseFirmInterlocutorEntryDto[];
}
