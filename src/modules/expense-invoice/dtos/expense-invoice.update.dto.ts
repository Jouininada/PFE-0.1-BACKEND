import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { ExpenseCreateInvoiceDto } from "./expense-invoice-create.dto";
import { ExpenseUpdateInvoiceUploadDto } from "./expense-invoice-upload.update.dto";

export class ExpenseUpdateInvoiceDto extends ExpenseCreateInvoiceDto {
    @ApiProperty({ example: 1, type: Number })
    id: number;
  
    @ApiProperty({ required: false })
    @IsOptional()
    uploads?: ExpenseUpdateInvoiceUploadDto[];

  
    @ApiProperty({ required: false })
    @IsOptional()
    amountPaid: number;
  }