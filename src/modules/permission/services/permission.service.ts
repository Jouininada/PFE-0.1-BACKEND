import { Injectable } from '@nestjs/common';
import { PermissionEntity } from '../repositories/entities/permission.entity';
import { PermissionNotFoundException } from '../errors/permission.notfound.error';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { ResponsePermissionDto } from '../dtos/permission.response.dto';
import { CreatePermissionDto } from '../dtos/permission.create.dto';
import { UpdatePermissionDto } from '../dtos/permission.update.dto';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PermissionRepository } from '../repositories/repository/permission.repository';

@Injectable()
export class PermissionService {
  constructor(private readonly permisisonRepository: PermissionRepository) {}

  async findOneById(id: number): Promise<PermissionEntity> {
    const permission = await this.permisisonRepository.findOneById(id);
    if (!permission) {
      throw new PermissionNotFoundException();
    }
    return permission;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<PermissionEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const permission = await this.permisisonRepository.findOne(
      queryOptions as FindOneOptions<PermissionEntity>,
    );
    if (!permission) return null;
    return permission;
  }

  async findAll(query: IQueryObject): Promise<ResponsePermissionDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.permisisonRepository.findAll(
      queryOptions as FindManyOptions<PermissionEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponsePermissionDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.permisisonRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.permisisonRepository.findAll(
      queryOptions as FindManyOptions<PermissionEntity>,
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

  async save(
    createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionEntity> {
    return this.permisisonRepository.save(createPermissionDto);
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionEntity> {
    await this.permisisonRepository.update(id, {
      ...updatePermissionDto,
    });
    return this.findOneById(id);
  }

  async softDelete(id: number): Promise<PermissionEntity> {
    return this.permisisonRepository.softDelete(id);
  }

  async deleteAll() {
    return this.permisisonRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.permisisonRepository.getTotalCount();
  }
}
