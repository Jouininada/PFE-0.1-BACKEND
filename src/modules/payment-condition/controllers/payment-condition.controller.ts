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
import { PaymentConditionService } from '../services/payment-condition.service';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { ResponsePaymentConditionDto } from '../dtos/payment-condition.response.dto';
import { CreatePaymentConditionDto } from '../dtos/payment-condition.create.dto';
import { UpdatePaymentConditionDto } from '../dtos/payment-condition.update.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { Request as ExpressRequest } from 'express';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';

@ApiTags('payment-condition')
@Controller({
  version: '1',
  path: '/payment-condition',
})
@UseInterceptors(LogInterceptor)
export class PaymentConditionController {
  constructor(
    private readonly paymentConditionService: PaymentConditionService,
  ) {}

  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponsePaymentConditionDto[]> {
    return this.paymentConditionService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponsePaymentConditionDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponsePaymentConditionDto>> {
    return this.paymentConditionService.findAllPaginated(query);
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
  ): Promise<ResponsePaymentConditionDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return this.paymentConditionService.findOneByCondition(query);
  }

  @Post('')
  @LogEvent(EVENT_TYPE.PAYMENT_CONDITION_CREATED)
  async save(
    @Body() createPaymentConditionDto: CreatePaymentConditionDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponsePaymentConditionDto> {
    const condition = await this.paymentConditionService.save(
      createPaymentConditionDto,
    );
    req.logInfo = { id: condition.id };
    return condition;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Put('/:id')
  @LogEvent(EVENT_TYPE.PAYMENT_CONDITION_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updatePaymentConditionDto: UpdatePaymentConditionDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponsePaymentConditionDto> {
    req.logInfo = { id };
    return this.paymentConditionService.update(id, updatePaymentConditionDto);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Delete('/:id')
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponsePaymentConditionDto> {
    req.logInfo = { id };
    return this.paymentConditionService.softDelete(id);
  }
}
