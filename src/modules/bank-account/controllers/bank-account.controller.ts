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
import { BankAccountService } from '../services/bank-account.service';
import { ResponseBankAccountDto } from '../dtos/bank-account.response.dto';
import { CreateBankAccountDto } from '../dtos/bank-account.create.dto';
import { UpdateBankAccountDto } from '../dtos/bank-account.update.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { Request as ExpressRequest } from 'express';

@ApiTags('bank-account')
@Controller({
  version: '1',
  path: '/bank-account',
})
@UseInterceptors(LogInterceptor)
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponseBankAccountDto[]> {
    return await this.bankAccountService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseBankAccountDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseBankAccountDto>> {
    return await this.bankAccountService.findAllPaginated(query);
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
  ): Promise<ResponseBankAccountDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return await this.bankAccountService.findOneByCondition(query);
  }

  @Post('')
  @LogEvent(EVENT_TYPE.BANK_ACCOUNT_CREATED)
  async save(
    @Body() createBankAccountDto: CreateBankAccountDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBankAccountDto> {
    const bank = await this.bankAccountService.save(createBankAccountDto);
    req.logInfo = { id: bank.id };
    return bank;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Put('/:id')
  @LogEvent(EVENT_TYPE.BANK_ACCOUNT_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBankAccountDto> {
    req.logInfo = { id };
    return await this.bankAccountService.update(id, updateBankAccountDto);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.BANK_ACCOUNT_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBankAccountDto> {
    req.logInfo = { id };
    return await this.bankAccountService.softDelete(id);
  }
}
