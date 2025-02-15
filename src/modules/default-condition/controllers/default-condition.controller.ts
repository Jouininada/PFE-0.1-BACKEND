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
import { DefaultConditionService } from '../services/default-condition.service';
import { ResponseDefaultConditionDto } from '../dtos/default-condition.response.dto';
import { CreateDefaultConditionDto } from '../dtos/default-condition.create.dto';
import { UpdateDefaultConditionDto } from '../dtos/default-condition.update.dto';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { Request as ExpressRequest } from 'express';

@ApiTags('default-condition')
@Controller({
  version: '1',
  path: '/default-condition',
})
@UseInterceptors(LogInterceptor)
export class DefaultConditionController {
  constructor(
    private readonly defaultConditionService: DefaultConditionService,
  ) {}

  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponseDefaultConditionDto[]> {
    return await this.defaultConditionService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseDefaultConditionDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseDefaultConditionDto>> {
    return await this.defaultConditionService.findAllPaginated(query);
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
  ): Promise<ResponseDefaultConditionDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return await this.defaultConditionService.findOneByCondition(query);
  }

  @Post('')
  @LogEvent(EVENT_TYPE.DEFAULT_CONDITION_CREATED)
  async save(
    @Body() createDefaultConditionDto: CreateDefaultConditionDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseDefaultConditionDto> {
    const condition = await this.defaultConditionService.save(
      createDefaultConditionDto,
    );
    req.logInfo = { id: condition.id };
    return condition;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Put('/batch-update')
  @LogEvent(EVENT_TYPE.DEFAULT_CONDITION_MASS_UPDATED)
  async batchUpdate(
    @Body()
    updateDefaultConditionDtos: UpdateDefaultConditionDto[],
    @Request() req: ExpressRequest,
  ): Promise<ResponseDefaultConditionDto[]> {
    req.logInfo = { ids: updateDefaultConditionDtos.map((entry) => entry.id) };
    return await this.defaultConditionService.updateMany(
      updateDefaultConditionDtos,
    );
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Put('/:id')
  @LogEvent(EVENT_TYPE.DEFAULT_CONDITION_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateDefaultConditionDto: UpdateDefaultConditionDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseDefaultConditionDto> {
    req.logInfo = { id };
    return await this.defaultConditionService.update(
      id,
      updateDefaultConditionDto,
    );
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.DEFAULT_CONDITION_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseDefaultConditionDto> {
    req.logInfo = { id };
    return await this.defaultConditionService.softDelete(id);
  }
}
