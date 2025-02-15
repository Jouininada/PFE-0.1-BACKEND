import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { PermissionService } from '../services/permission.service';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { ResponsePermissionDto } from '../dtos/permission.response.dto';
import { CreatePermissionDto } from '../dtos/permission.create.dto';
import { UpdatePermissionDto } from '../dtos/permission.update.dto';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { PageDto } from 'src/common/database/dtos/database.page.dto';

@ApiTags('permission')
@Controller({
  version: '1',
  path: '/permission',
})
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponsePermissionDto[]> {
    return await this.permissionService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponsePermissionDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponsePermissionDto>> {
    return this.permissionService.findAllPaginated(query);
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
  ): Promise<ResponsePermissionDto> {
    if (query.filter) query.filter += `,id||$eq||${id}`;
    else query.filter = `id||$eq||${id}`;
    return await this.permissionService.findOneByCondition(query);
  }

  @Post('')
  async save(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<ResponsePermissionDto> {
    return await this.permissionService.save(createPermissionDto);
  }

  @Put('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async update(
    @Param('id') id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<ResponsePermissionDto> {
    return await this.permissionService.update(id, updatePermissionDto);
  }

  @Delete('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async delete(@Param('id') id: number): Promise<ResponsePermissionDto> {
    return await this.permissionService.softDelete(id);
  }
}
