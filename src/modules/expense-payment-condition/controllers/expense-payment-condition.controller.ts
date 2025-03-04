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
  import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
  import { PageDto } from 'src/common/database/dtos/database.page.dto';
  import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
  import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
  import { Request as ExpressRequest } from 'express';
  import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { ExpensePaymentConditionService } from '../services/expense-payment-condition.service';
import { ExpenseResponsePaymentConditionDto } from '../dtos/expense-payment-condition.response.dto';
import { ExpenseUpdatePaymentConditionDto } from '../dtos/expense-payment-condition.update.dto';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { ExpenseCreatePaymentConditionDto } from '../dtos/expense-payment-condition.create.dto';
  
  @ApiTags('expense-payment-condition')
  @Controller({
    version: '1',
    path: '/expense-payment-condition',
  })
  @UseInterceptors(LogInterceptor)
  export class ExpensePaymentConditionController {
    constructor(
      private readonly paymentConditionService: ExpensePaymentConditionService,
    ) {}
  
    @Get('/all')
    async findAll(
      @Query() options: IQueryObject,
    ): Promise<ExpenseResponsePaymentConditionDto[]> {
      return this.paymentConditionService.findAll(options);
    }
  
    @Get('/list')
    @ApiPaginatedResponse(ExpenseResponsePaymentConditionDto)
    async findAllPaginated(
      @Query() query: IQueryObject,
    ): Promise<PageDto<ExpenseResponsePaymentConditionDto>> {
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
    ): Promise<ExpenseResponsePaymentConditionDto> {
      query.filter
        ? (query.filter += `,id||$eq||${id}`)
        : (query.filter = `id||$eq||${id}`);
      return this.paymentConditionService.findOneByCondition(query);
    }
  
    @Post('')
    @LogEvent(EVENT_TYPE.EXPENSE_PAYMENT_CONDITION_CREATED)
    async save(
      @Body() createPaymentConditionDto: ExpenseCreatePaymentConditionDto,
      @Request() req: ExpressRequest,
    ): Promise<ExpenseResponsePaymentConditionDto> {
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
    @LogEvent(EVENT_TYPE.EXPENSE_PAYMENT_CONDITION_UPDATED)
    async update(
      @Param('id') id: number,
      @Body() updatePaymentConditionDto: ExpenseUpdatePaymentConditionDto,
      @Request() req: ExpressRequest,
    ): Promise<ExpenseResponsePaymentConditionDto> {
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
    ): Promise<ExpenseResponsePaymentConditionDto> {
      req.logInfo = { id };
      return this.paymentConditionService.softDelete(id);
    }
  }
  