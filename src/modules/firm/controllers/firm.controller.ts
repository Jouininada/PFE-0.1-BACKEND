import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Put,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { FirmService } from '../services/firm.service';
import { ResponseFirmDto } from '../dtos/firm.response.dto';
import { CreateFirmDto } from '../dtos/firm.create.dto';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { UpdateFirmDto } from '../dtos/firm.update.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { Request as ExpressRequest } from 'express';

@ApiTags('firm')
@Controller({
  version: '1',
  path: '/firm',
})
@UseInterceptors(LogInterceptor)
export class FirmController {
  constructor(private readonly firmService: FirmService) {}

  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseFirmDto[]> {
    return await this.firmService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseFirmDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseFirmDto>> {
    return await this.firmService.findAllPaginated(query);
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
  ): Promise<ResponseFirmDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return await this.firmService.findOneByCondition(query);
  }

  @Post('')
  @LogEvent(EVENT_TYPE.FIRM_CREATED)
  async save(
    @Body() createFirmDto: CreateFirmDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseFirmDto> {
    const firm = await this.firmService.save(createFirmDto);
    req.logInfo = { id: firm.id };
    return firm;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Put('/:id')
  @LogEvent(EVENT_TYPE.FIRM_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateActivityDto: UpdateFirmDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseFirmDto> {
    req.logInfo = { id };
    return await this.firmService.update(id, updateActivityDto);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.FIRM_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseFirmDto> {
    req.logInfo = { id };
    return await this.firmService.softDelete(id);
  }
}
