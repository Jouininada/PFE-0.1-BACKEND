import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { CreateUserDto } from '../dtos/user.create.dto';
import { ResponseUserDto } from '../dtos/user.response.dto';
import { UpdateUserDto } from '../dtos/user.update.dto';
import { UserEntity } from '../repositories/entities/user.entity';
import { UserService } from '../services/user.service';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { Request as ExpressRequest } from 'express';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';

@ApiTags('user')
@Controller({
  version: '1',
  path: '/user',
})
@UseInterceptors(LogInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/list')
  @ApiPaginatedResponse(ResponseUserDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseUserDto>> {
    return this.userService.findAllPaginated(query);
  }

  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseUserDto[]> {
    return this.userService.findAll(options);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return user by ID.',
    type: UserEntity,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOneById(
    @Param('id') id: number,
    @Query() query: IQueryObject,
  ): Promise<ResponseUserDto> {
    if (query.filter) query.filter += `,id||$eq||${id}`;
    else query.filter = `id||$eq||${id}`;
    return this.userService.findOneByCondition(query);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 200,
    description: 'User created successfully.',
    type: UserEntity,
  })
  @Post()
  @LogEvent(EVENT_TYPE.USER_CREATED)
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request() req: ExpressRequest,
  ): Promise<UserEntity> {
    const user = await this.userService.save(createUserDto);
    req.logInfo = { id: user.id };
    return user;
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    type: UserEntity,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Put(':id')
  @LogEvent(EVENT_TYPE.USER_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: ExpressRequest,
  ): Promise<UserEntity> {
    req.logInfo = { id };
    return this.userService.update(id, updateUserDto);
  }

  @Put('/deactivate/:id')
  @LogEvent(EVENT_TYPE.USER_DEACTIVATED)
  async deactivate(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<UserEntity> {
    req.logInfo = { id };
    return this.userService.update(id, { isActive: false });
  }

  @Put('/activate/:id')
  @LogEvent(EVENT_TYPE.USER_ACTIVATED)
  async activate(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<UserEntity> {
    req.logInfo = { id };
    return this.userService.update(id, { isActive: true });
  }
}
