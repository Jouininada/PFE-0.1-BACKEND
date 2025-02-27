import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";
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

     @IsOptional()
      @IsString()
      @MaxLength(25)
      sequentialNumbr?: string;
  }