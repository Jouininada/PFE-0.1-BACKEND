import { ApiProperty } from '@nestjs/swagger';

export class ResponseQuotationMetaDataDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: true, type: Boolean })
  showInvoiceAddress: boolean;

  @ApiProperty({ example: true, type: Boolean })
  showDeliveryAddress: boolean;

  @ApiProperty({ example: true, type: Boolean })
  showArticleDescription: boolean;

  @ApiProperty({ example: true, type: Boolean })
  hasBankingDetails?: boolean;

  @ApiProperty({ example: true, type: Boolean })
  hasGeneralConditions?: boolean;

  @ApiProperty({ example: {}, type: Object })
  taxSummary: any;
}
