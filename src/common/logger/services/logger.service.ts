import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions } from 'typeorm';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { LoggerRepository } from '../repositories/repository/logger.repository';
import { LoggerEntity } from '../repositories/entities/logger.entity';
import { LogNotFoundException } from '../errors/log.notfound.error';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { EventsGateway } from 'src/common/gateways/events/events.gateway';
import { WSRoom } from 'src/app/enums/ws-room.enum';

@Injectable()
export class LoggerService {
  constructor(
    private readonly loggerRepository: LoggerRepository,
    private readonly wsGateway: EventsGateway,
  ) {}

  async findOneById(id: number): Promise<LoggerEntity> {
    const log = await this.loggerRepository.findOneById(id);
    if (!log) {
      throw new LogNotFoundException();
    }
    return log;
  }

  async findAll(query: IQueryObject): Promise<LoggerEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.loggerRepository.findAll(
      queryOptions as FindManyOptions<LoggerEntity>,
    );
  }

  async findAllPaginated(query: IQueryObject): Promise<PageDto<LoggerEntity>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.loggerRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.loggerRepository.findAll(
      queryOptions as FindManyOptions<LoggerEntity>,
    );

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: {
        page: parseInt(query.page),
        take: parseInt(query.limit),
      },
      itemCount: count,
    });

    return new PageDto(entities, pageMetaDto);
  }

  async save(log: Partial<LoggerEntity>): Promise<LoggerEntity> {
    const entity = await this.loggerRepository.save(log);
    this.wsGateway.sendToRoom(WSRoom.LOGGER, 'new-log', entity);
    return entity;
  }

  async softDelete(id: number): Promise<LoggerEntity> {
    await this.findOneById(id);
    return this.loggerRepository.softDelete(id);
  }

  async deleteAll() {
    return this.loggerRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.loggerRepository.getTotalCount();
  }
}
