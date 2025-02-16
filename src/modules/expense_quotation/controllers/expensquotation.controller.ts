/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { ExpensQuotationService } from '../services/expensquotation.service';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { ExpensQuotationSequence } from '../interfaces/expensquotation-sequence.interface';
import { EXPENSQUOTATION_STATUS } from '../enums/expensquotation-status.enum';
import { InvoiceService } from 'src/modules/invoice/services/invoice.service';
import { QUOTATION_STATUS } from 'src/modules/quotation/enums/quotation-status.enum';
import { ResponseExpensQuotationDto } from '../dtos/expensquotation.response.dto';
import { CreateExpensQuotationDto } from '../dtos/expensquotation.create.dto';
import { DuplicateExpensQuotationDto } from '../dtos/expensquotation.duplicate.dto';

@ApiTags('expensquotation')
@Controller({
  version: '1',
  path: '/expensquotation',
})
export class ExpensQuotationController {
  constructor(
    private readonly expensQuotationService: ExpensQuotationService,
    private readonly invoiceService: InvoiceService,
  ) {}

  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponseExpensQuotationDto[]> {
    return await this.expensQuotationService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseExpensQuotationDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseExpensQuotationDto>> {
    return await this.expensQuotationService.findAllPaginated(query);
  }

//fonctionne
    @Get('/:id')
    @ApiParam({
      name: 'id',
      type: 'number',
      required: true,
    })
    async findOneById(
      @Param('id') id: number,
      @Query() query: IQueryObject,
    ): Promise<ResponseExpensQuotationDto> {
      query.filter
        ? (query.filter += `,id||$eq||${id}`)
        : (query.filter = `id||$eq||${id}`);
      return await this.expensQuotationService.findOneByCondition(query);
    }
//fonctionne
    @Post('/save')
  async save(
    @Body() createExpensQuotationDto: CreateExpensQuotationDto,
  ): Promise<ResponseExpensQuotationDto> {
    return await this.expensQuotationService.save(createExpensQuotationDto);
  }
/*
  
  @Post('/duplicate')
  async duplicate(
    @Body() duplicateExpensQuotationDto: DuplicateExpensQuotationDto,
  ): Promise<ResponseExpensQuotationDto> {
    return await this.expensQuotationService.duplicate(duplicateExpensQuotationDto);
  }
*/

 
}
