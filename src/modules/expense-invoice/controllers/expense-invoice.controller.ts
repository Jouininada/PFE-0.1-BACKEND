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
    Request,
    UseInterceptors,
  } from '@nestjs/common';
  import { ApiTags, ApiParam } from '@nestjs/swagger';
  import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
  import { PageDto } from 'src/common/database/dtos/database.page.dto';
  import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
  import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
  import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
  import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
  import { Request as ExpressRequest } from 'express';
import { ExpenseResponseInvoiceDto } from '../dtos/expense-invoice.response.dto';
import { ExpenseCreateInvoiceDto } from '../dtos/expense-invoice-create.dto';
import { ExpenseDuplicateInvoiceDto } from '../dtos/expense-invoice.duplicate.dto';
import { ExpenseUpdateInvoiceSequenceDto } from '../dtos/expense-invoice-sequence.update.dto';
import { ExpenseInvoiceSequence } from '../interfaces/expense-invoice-sequence.interface';
import { ExpenseUpdateInvoiceDto } from '../dtos/expense-invoice.update.dto';
import { ExpenseInvoiceService } from '../services/expense-invoice.service';
import { ExpenseResponseInvoiceRangeDto } from '../dtos/expense-invoice-range.response.dto';
  
  @ApiTags('expenseinvoice')
  @Controller({
    version: '1',
    path: '/expenseinvoice',
  })
  @UseInterceptors(LogInterceptor)
  export class ExpenseInvoiceController {
    constructor(private readonly invoiceService: ExpenseInvoiceService) {}
  
    @Get('/all')
    async findAll(@Query() options: IQueryObject): Promise<ExpenseResponseInvoiceDto[]> {
      return this.invoiceService.findAll(options);
    }
  
    @Get('/list')
    @ApiPaginatedResponse(ExpenseResponseInvoiceDto)
    async findAllPaginated(
      @Query() query: IQueryObject,
    ): Promise<PageDto<ExpenseResponseInvoiceDto>> {
      return this.invoiceService.findAllPaginated(query);
    }
  
    @Get('/sequential-range/:id')
async findInvoicesByRange(
  @Param('id') id: number,
): Promise<ExpenseResponseInvoiceRangeDto> {  // ✅ Correction ici
  return this.invoiceService.findInvoicesByRange(id);
}

  
    @Get('/:id')
    @ApiParam({
      name: 'id',
      type: 'number',
      required: true,
    })
    async findOneById(
      @Param('id') id: number,
      @Query() query: IQueryObject,
    ): Promise<ExpenseResponseInvoiceDto> {
      query.filter
        ? (query.filter += `,id||$eq||${id}`)
        : (query.filter = `id||$eq||${id}`);
      return this.invoiceService.findOneByCondition(query);
    }
  
    @Get('/:id/download')
    @Header('Content-Type', 'application/json')
    @Header('Content-Disposition', 'attachment; filename="invoice.pdf"')
    @LogEvent(EVENT_TYPE.BUYING_INVOICE_PRINTED)
    async generatePdf(
      @Param('id') id: number,
      @Query() query: { template: string },
      @Request() req: ExpressRequest,
    ) {
      req.logInfo = { id };
      return this.invoiceService.downloadPdf(id, query.template);
    }
  
    @Post('')
    @LogEvent(EVENT_TYPE.BUYING_INVOICE_CREATED)
    async save(
      @Body() createInvoiceDto: ExpenseCreateInvoiceDto,
      @Request() req: ExpressRequest,
    ): Promise<ExpenseResponseInvoiceDto> {
      const invoice = await this.invoiceService.save(createInvoiceDto);
      req.logInfo = { id: invoice.id };
      return invoice;
    }
  
    @Post('/duplicate')
    @LogEvent(EVENT_TYPE.BUYING_INVOICE_DUPLICATED)
    async duplicate(
      @Body() duplicateInvoiceDto: ExpenseDuplicateInvoiceDto,
      @Request() req: ExpressRequest,
    ): Promise<ExpenseResponseInvoiceDto> {
      const invoice = await this.invoiceService.duplicate(duplicateInvoiceDto);
      req.logInfo = { id: duplicateInvoiceDto.id, duplicateId: invoice.id };
      return invoice;
    }
  
    @ApiParam({
      name: 'id',
      type: 'number',
      required: true,
    })
    @Put('/update-invoice-sequences')
    async updateInvoiceSequences(
      @Body() updatedSequenceDto: ExpenseUpdateInvoiceSequenceDto,
    ): Promise<ExpenseInvoiceSequence> {
      return this.invoiceService.updateInvoiceSequence(updatedSequenceDto);
    }
  
    @ApiParam({
      name: 'id',
      type: 'number',
      required: true,
    })
    @Put('/:id')
    @LogEvent(EVENT_TYPE.BUYING_INVOICE_UPDATED)
    async update(
      @Param('id') id: number,
      @Body() updateInvoiceDto: ExpenseUpdateInvoiceDto,
      @Request() req: ExpressRequest,
    ): Promise<ExpenseResponseInvoiceDto> {
      req.logInfo = { id };
      return this.invoiceService.update(id, updateInvoiceDto);
    }
  
    @ApiParam({
      name: 'id',
      type: 'number',
      required: true,
    })
    @Delete('/:id')
    @LogEvent(EVENT_TYPE.BUYING_INVOICE_DELETED)
    async delete(
      @Param('id') id: number,
      @Request() req: ExpressRequest,
    ): Promise<ExpenseResponseInvoiceDto> {
      req.logInfo = { id };
      return this.invoiceService.softDelete(id);
    }
  }
  