import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ExpenseCreateArticleInvoiceEntryTaxDto {
  @ApiProperty({})
  taxId?: number;

  @ApiProperty({})
  @IsOptional()
  articleInvoiceEntryId?: number;
}
