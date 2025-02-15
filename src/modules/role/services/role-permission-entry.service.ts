import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { RolePermissionEntryRepository } from '../repositories/repository/role-permission.repository';
import { RolePermissionEntryEntity } from '../repositories/entities/role-permission-entry.entity';
import { RolePermissionEntryNotFoundException } from '../errors/role-premission-entry.notfound.error';
import { ResponseRolePermissionEntryDto } from '../dtos/role-permission-entry.response.dto';
import { CreateRolePermissionEntryDto } from '../dtos/role-permission-entry.create.dto';
import { UpdateRolePermissionEntryDto } from '../dtos/role-permission-entry.update.dto';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';

@Injectable()
export class RolePermissionEntryService {
  constructor(
    private readonly rolePermissionEntryRepository: RolePermissionEntryRepository,
  ) {}

  async findOneById(id: number): Promise<RolePermissionEntryEntity> {
    const entry = await this.rolePermissionEntryRepository.findOneById(id);
    if (!entry) {
      throw new RolePermissionEntryNotFoundException();
    }
    return entry;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<RolePermissionEntryEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const entry = await this.rolePermissionEntryRepository.findOne(
      queryOptions as FindOneOptions<RolePermissionEntryEntity>,
    );
    if (!entry) return null;
    return entry;
  }

  async findAll(
    query: IQueryObject,
  ): Promise<ResponseRolePermissionEntryDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.rolePermissionEntryRepository.findAll(
      queryOptions as FindManyOptions<RolePermissionEntryEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseRolePermissionEntryDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.rolePermissionEntryRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.rolePermissionEntryRepository.findAll(
      queryOptions as FindManyOptions<RolePermissionEntryEntity>,
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
    createRolePermissionEntryDto: CreateRolePermissionEntryDto,
  ): Promise<RolePermissionEntryEntity> {
    return this.rolePermissionEntryRepository.save(
      createRolePermissionEntryDto,
    );
  }

  async saveMany(
    createRolePermissionEntryDtos: CreateRolePermissionEntryDto[],
  ): Promise<RolePermissionEntryEntity[]> {
    return Promise.all(
      createRolePermissionEntryDtos.map((dto) =>
        this.rolePermissionEntryRepository.save(dto),
      ),
    );
  }

  async update(
    id: number,
    updateRolePermissionEntryDto: UpdateRolePermissionEntryDto,
  ): Promise<RolePermissionEntryEntity> {
    await this.rolePermissionEntryRepository.update(id, {
      ...updateRolePermissionEntryDto,
    });
    return this.findOneById(id);
  }

  async softDelete(id: number): Promise<RolePermissionEntryEntity> {
    return this.rolePermissionEntryRepository.softDelete(id);
  }

  async softDeleteMany(ids: number[]): Promise<RolePermissionEntryEntity[]> {
    return this.rolePermissionEntryRepository.softDeleteMany(ids);
  }

  async deleteAll() {
    return this.rolePermissionEntryRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.rolePermissionEntryRepository.getTotalCount();
  }
}
