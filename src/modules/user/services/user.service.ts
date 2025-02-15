import { Transactional } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import { encryptPasswordWithSalt10 } from 'src/common/auth/utils/encrypt-password';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { CreateUserDto } from '../dtos/user.create.dto';
import { UpdateUserDto } from '../dtos/user.update.dto';
import { UserEntity } from '../repositories/entities/user.entity';
import { UserNotFoundException } from '../errors/user.notfound.error';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { UserRepository } from '../repositories/repository/user.repository';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findOneById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOneById(id);
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  async findOneByCondition(query: IQueryObject): Promise<UserEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const user = await this.userRepository.findOne(
      queryOptions as FindOneOptions<UserEntity>,
    );
    if (!user) return null;
    return user;
  }

  async findAll(query: IQueryObject): Promise<UserEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.userRepository.findAll(
      queryOptions as FindManyOptions<UserEntity>,
    );
  }

  async findAllPaginated(query: IQueryObject): Promise<PageDto<UserEntity>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.userRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.userRepository.findAll(
      queryOptions as FindManyOptions<UserEntity>,
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

  @Transactional()
  async save(createUserDto: CreateUserDto) {
    return this.userRepository.save({
      ...createUserDto,
      password: await encryptPasswordWithSalt10(createUserDto.password),
    });
  }

  @Transactional()
  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const updateData: Partial<UpdateUserDto> = { ...updateUserDto };
    if (updateUserDto.password !== undefined) {
      updateData.password = await encryptPasswordWithSalt10(
        updateUserDto.password,
      );
      updateData.refreshToken = null;
    }
    await this.userRepository.update(id, updateData);
    return this.findOneById(id);
  }
}
