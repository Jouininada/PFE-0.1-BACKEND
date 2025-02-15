import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { LoggerService } from '../services/logger.service';
import { LoggerEntity } from '../repositories/entities/logger.entity';

@ApiTags('logger')
@Controller({
  version: '1',
  path: '/logger',
})
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<LoggerEntity[]> {
    return await this.loggerService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(LoggerEntity)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<LoggerEntity>> {
    return await this.loggerService.findAllPaginated(query);
  }
}
