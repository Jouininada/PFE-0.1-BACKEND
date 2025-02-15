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
import { InvoiceService } from '../services/invoice.service';
import { ResponseInvoiceDto } from '../dtos/invoice.response.dto';
import { CreateInvoiceDto } from '../dtos/invoice.create.dto';
import { DuplicateInvoiceDto } from '../dtos/invoice.duplicate.dto';
import { InvoiceSequence } from '../interfaces/invoice-sequence.interface';
import { UpdateInvoiceSequenceDto } from '../dtos/invoice-seqence.update.dto';
import { UpdateInvoiceDto } from '../dtos/invoice.update.dto';
import { ResponseInvoiceRangeDto } from '../dtos/invoice-range.response.dto';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { Request as ExpressRequest } from 'express';

@ApiTags('invoice')
@Controller({
  version: '1',
  path: '/invoice',
})
@UseInterceptors(LogInterceptor)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseInvoiceDto[]> {
    return this.invoiceService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseInvoiceDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseInvoiceDto>> {
    return this.invoiceService.findAllPaginated(query);
  }

  @Get('/sequential-range/:id')
  async findInvoicesByRange(
    @Param('id') id: number,
  ): Promise<ResponseInvoiceRangeDto> {
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
  ): Promise<ResponseInvoiceDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return this.invoiceService.findOneByCondition(query);
  }

  @Get('/:id/download')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="invoice.pdf"')
  @LogEvent(EVENT_TYPE.SELLING_INVOICE_PRINTED)
  async generatePdf(
    @Param('id') id: number,
    @Query() query: { template: string },
    @Request() req: ExpressRequest,
  ) {
    req.logInfo = { id };
    return this.invoiceService.downloadPdf(id, query.template);
  }

  @Post('')
  @LogEvent(EVENT_TYPE.SELLING_INVOICE_CREATED)
  async save(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseInvoiceDto> {
    const invoice = await this.invoiceService.save(createInvoiceDto);
    req.logInfo = { id: invoice.id };
    return invoice;
  }

  @Post('/duplicate')
  @LogEvent(EVENT_TYPE.SELLING_INVOICE_DUPLICATED)
  async duplicate(
    @Body() duplicateInvoiceDto: DuplicateInvoiceDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseInvoiceDto> {
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
    @Body() updatedSequenceDto: UpdateInvoiceSequenceDto,
  ): Promise<InvoiceSequence> {
    return this.invoiceService.updateInvoiceSequence(updatedSequenceDto);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Put('/:id')
  @LogEvent(EVENT_TYPE.SELLING_INVOICE_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseInvoiceDto> {
    req.logInfo = { id };
    return this.invoiceService.update(id, updateInvoiceDto);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.SELLING_INVOICE_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseInvoiceDto> {
    req.logInfo = { id };
    return this.invoiceService.softDelete(id);
  }
}
