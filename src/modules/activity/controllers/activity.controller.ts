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
import { ActivityService } from '../services/activity.service';
import { CreateActivityDto } from '../dtos/activity.create.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { UpdateActivityDto } from '../dtos/activity.update.dto';
import { ResponseActivityDto } from '../dtos/activity.response.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { Request as ExpressRequest } from 'express';

@ApiTags('activity')
@Controller({
  version: '1',
  path: '/activity',
})
@UseInterceptors(LogInterceptor)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponseActivityDto[]> {
    return await this.activityService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseActivityDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseActivityDto>> {
    return await this.activityService.findAllPaginated(query);
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
  ): Promise<ResponseActivityDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return await this.activityService.findOneByCondition(query);
  }

  @Post('')
  @LogEvent(EVENT_TYPE.ACTIVITY_CREATED)
  async save(
    @Body() createActivityDto: CreateActivityDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseActivityDto> {
    const activty = await this.activityService.save(createActivityDto);
    req.logInfo = { id: activty.id };
    return activty;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Put('/:id')
  @LogEvent(EVENT_TYPE.ACTIVITY_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateActivityDto: UpdateActivityDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseActivityDto> {
    req.logInfo = { id };
    return await this.activityService.update(id, updateActivityDto);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.ACTIVITY_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseActivityDto> {
    req.logInfo = { id };
    return await this.activityService.softDelete(id);
  }
}
