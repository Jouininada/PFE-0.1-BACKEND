import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  QueryRunner,
  SelectQueryBuilder,
} from 'typeorm';

export interface DatabaseInterfaceRepository<T> {
  createQueryBuilder(
    alias?: string,
    queryRunner?: QueryRunner,
  ): Promise<SelectQueryBuilder<T>>;
  getRelatedEntityNames(): Promise<string[]>;
  create(data: DeepPartial<T>): T;
  createMany(data: DeepPartial<T>[]): T[];
  save(data: DeepPartial<T>): Promise<T>;
  saveMany(data: DeepPartial<T>[]): Promise<T[]>;
  findOneById(id: string): Promise<T | undefined>;
  findByCondition(filterCondition: FindOneOptions<T>): Promise<T>;
  findAll(options?: FindManyOptions<T>): Promise<T[]>;
  findOne(options: FindOneOptions<T>): Promise<T | undefined>;
  findWithRelations(relations: FindManyOptions<T>): Promise<T[]>;
  remove(data: T): Promise<T>;
  preload(entityLike: DeepPartial<T>): Promise<T>;
  getTotalCount(options: FindOneOptions<T>): Promise<number>;
  delete(id: string | number): Promise<void>;
  softDelete(id: string | number): Promise<T>;
  softDeleteMany(ids: (string | number)[]): Promise<T[]>;
  deleteAll(): Promise<void>;
}
