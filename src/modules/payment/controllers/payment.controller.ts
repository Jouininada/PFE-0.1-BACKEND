import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { PaymentService } from '../services/payment.service';
import { ResponsePaymentDto } from '../dtos/payment.response.dto';
import { CreatePaymentDto } from '../dtos/payment.create.dto';
import { UpdatePaymentDto } from '../dtos/payment.update.dto';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { Request as ExpressRequest } from 'express';

@ApiTags('payment')
@Controller({
  version: '1',
  path: '/payment',
})
@UseInterceptors(LogInterceptor)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponsePaymentDto[]> {
    return this.paymentService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponsePaymentDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponsePaymentDto>> {
    return this.paymentService.findAllPaginated(query);
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
  ): Promise<ResponsePaymentDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return this.paymentService.findOneByCondition(query);
  }

  @Post('')
  @LogEvent(EVENT_TYPE.SELLING_PAYMENT_CREATED)
  async save(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponsePaymentDto> {
    const payment = await this.paymentService.save(createPaymentDto);
    req.logInfo = { id: payment.id };
    return payment;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Put('/:id')
  @LogEvent(EVENT_TYPE.SELLING_PAYMENT_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateActivityDto: UpdatePaymentDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponsePaymentDto> {
    req.logInfo = { id };
    return this.paymentService.update(id, updateActivityDto);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.SELLING_PAYMENT_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponsePaymentDto> {
    req.logInfo = { id };
    return this.paymentService.softDelete(id);
  }
}
