/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { ResponseTaxDto } from 'src/modules/tax/dtos/tax.response.dto';

export class CreateArticleExpenseQuotationEntryTaxDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: 1, type: Number })
  expenseArticleEntryId?: number; // Correction du nom

  @ApiProperty({
    example: 1, // Correction de l'exemple (supprimer les guillemets)
    type: Number,
  })
  taxId?: number;

  @ApiProperty({ type: () => ResponseTaxDto })
  tax?: ResponseTaxDto;
}
