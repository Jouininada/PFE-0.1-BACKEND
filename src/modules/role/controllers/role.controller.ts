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
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { UpdateRoleDto } from '../dtos/role.update.dto';
import { ResponseRoleDto } from '../dtos/role.response.dto';
import { CreateRoleDto } from '../dtos/role.create.dto';
import { RoleService } from '../services/role.service';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { Request as ExpressRequest } from 'express';

@ApiTags('role')
@Controller({
  version: '1',
  path: '/role',
})
@UseInterceptors(LogInterceptor)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseRoleDto[]> {
    return this.roleService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseRoleDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseRoleDto>> {
    return this.roleService.findAllPaginated(query);
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
  ): Promise<ResponseRoleDto> {
    if (query.filter) query.filter += `,id||$eq||${id}`;
    else query.filter = `id||$eq||${id}`;
    return this.roleService.findOneByCondition(query);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Post('/duplicate/:id')
  @LogEvent(EVENT_TYPE.ROLE_DUPLICATED)
  async duplicate(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseRoleDto> {
    req.logInfo = { id };
    return this.roleService.duplicate(id);
  }

  @Post('')
  @LogEvent(EVENT_TYPE.ROLE_CREATED)
  async save(
    @Body() createRoleDto: CreateRoleDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseRoleDto> {
    const role = await this.roleService.save(createRoleDto);
    req.logInfo = { id: role.id };
    return role;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Put('/:id')
  @LogEvent(EVENT_TYPE.ROLE_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseRoleDto> {
    req.logInfo = { id };
    return this.roleService.update(id, updateRoleDto);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.ROLE_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseRoleDto> {
    req.logInfo = { id };
    return this.roleService.softDelete(id);
  }
}
