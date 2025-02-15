import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  NotFoundException,
  Param,
  Body,
  ConflictException,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { TaxService } from '../services/tax.service';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { CreateTaxDto } from '../dtos/tax.create.dto';
import { UpdateTaxDto } from '../dtos/tax.update.dto';
import { ResponseTaxDto } from '../dtos/tax.response.dto';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { Request as ExpressRequest } from 'express';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';

@ApiTags('tax')
@Controller({
  version: '1',
  path: '/tax',
})
@UseInterceptors(LogInterceptor)
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseTaxDto[]> {
    return await this.taxService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseTaxDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseTaxDto>> {
    return await this.taxService.findAllPaginated(query);
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
  ): Promise<ResponseTaxDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return await this.taxService.findOneByCondition(query);
  }

  @Post('')
  @LogEvent(EVENT_TYPE.TAX_CREATED)
  async save(
    @Body() createTaxDto: CreateTaxDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseTaxDto> {
    let tax = await this.taxService.findOneByCondition({
      filter: `label||$eq||${createTaxDto.label}`,
    });
    if (tax) {
      throw new ConflictException(
        `Tax with label "${createTaxDto.label}" already exists`,
      );
    }
    tax = await this.taxService.save(createTaxDto);
    req.logInfo = { id: tax.id };
    return tax;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Put('/:id')
  @LogEvent(EVENT_TYPE.TAX_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateTaxDto: UpdateTaxDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseTaxDto> {
    const tax = await this.taxService.update(id, updateTaxDto);
    if (!tax) {
      throw new NotFoundException(`Tax with ID ${id} not found`);
    }
    req.logInfo = { id };
    return tax;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.TAX_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseTaxDto> {
    const tax = await this.taxService.softDelete(id);
    if (!tax) {
      throw new NotFoundException(`Tax with ID ${id} not found`);
    }
    req.logInfo = { id };
    return tax;
  }
}
