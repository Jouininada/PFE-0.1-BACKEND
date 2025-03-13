import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  In,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { DatabaseInterfaceRepository } from '../interfaces/database.repository.interface';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class DatabaseAbstractRepository<T>
  implements DatabaseInterfaceRepository<T>
{
  protected txHost?: TransactionHost<TransactionalAdapterTypeOrm>;

  protected constructor(
    protected readonly entity: Repository<T>,
    txHost?: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    this.txHost = txHost;
  }

  /**
   * Retourne le repository actuel, en tenant compte de la transaction si elle existe.
   */
  private getRepository(): Repository<T> {
    return this.txHost?.tx?.getRepository(this.entity.target) || this.entity;
  }

  /**
   * Crée un QueryBuilder pour effectuer des requêtes personnalisées.
   */
  public async createQueryBuilder(
    alias?: string,
    queryRunner?: QueryRunner,
  ): Promise<SelectQueryBuilder<T>> {
    return this.getRepository().createQueryBuilder(alias, queryRunner);
  }

  /**
   * Retourne les noms des entités liées à l'entité actuelle.
   */
  public async getRelatedEntityNames(): Promise<string[]> {
    return this.getRepository()
      .metadata.relations.filter(
        (relation) =>
          relation.isManyToOne || relation.isOneToOne || relation.isManyToMany,
      )
      .map((relation) => relation.propertyName);
  }

  /**
   * Recherche une entité par son ID.
   */
  public async findOneById(id: string | number): Promise<T> {
    const options: FindOptionsWhere<T> = {
      id: id,
    } as unknown as FindOptionsWhere<T>;
    return await this.getRepository().findOneBy(options);
  }

  /**
   * Enregistre une entité.
   */
  public async save(data: DeepPartial<T>): Promise<T> {
    return await this.getRepository().save(data);
  }

  /**
   * Enregistre plusieurs entités.
   */
  public async saveMany(data: DeepPartial<T>[]): Promise<T[]> {
    return this.getRepository().save(data);
  }

  /**
   * Crée une nouvelle instance d'entité sans l'enregistrer en base de données.
   */
  public create(data: DeepPartial<T>): T {
    return this.getRepository().create(data);
  }

  /**
   * Crée plusieurs instances d'entités sans les enregistrer en base de données.
   */
  public createMany(data: DeepPartial<T>[]): T[] {
    return this.getRepository().create(data);
  }

  /**
   * Recherche des entités en fonction des options fournies.
   */
  public async find(options?: FindManyOptions<T>): Promise<T[]> {
    return this.getRepository().find(options);
  }

  /**
   * Met à jour une entité par son ID.
   */
  public async update(
    id: string | number,
    data: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return await this.getRepository().update(id, data);
  }

  /**
   * Met à jour plusieurs entités.
   */
  public async updateMany(data: DeepPartial<T>[]): Promise<T[]> {
    return await this.getRepository().save(data);
  }

  /**
   * Recherche une entité en fonction d'une condition spécifique.
   */
  public async findByCondition(filterCondition: FindOneOptions<T>): Promise<T> {
    return await this.getRepository().findOne(filterCondition);
  }

  /**
   * Recherche des entités avec des relations spécifiques.
   */
  public async findWithRelations(relations: FindManyOptions<T>): Promise<T[]> {
    return await this.getRepository().find(relations);
  }

  /**
   * Recherche une entité en fonction des options fournies.
   */
  public async findOne(options: FindOneOptions<T>): Promise<T | undefined> {
    return this.getRepository().findOne(options);
  }

  /**
   * Recherche toutes les entités en fonction des options fournies.
   */
  public async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.getRepository().find(options);
  }

  /**
   * Supprime une entité de la base de données.
   */
  public async remove(data: T): Promise<T> {
    return await this.getRepository().remove(data);
  }

  /**
   * Prépare une entité pour la mise à jour.
   */
  public async preload(entityLike: DeepPartial<T>): Promise<T> {
    return await this.getRepository().preload(entityLike);
  }

  /**
   * Retourne le nombre total d'entités.
   */
  public async getTotalCount(options?: FindManyOptions<T>): Promise<number> {
    try {
      // Vérifier que les options sont valides
      if (!options || typeof options !== 'object') {
        throw new Error('Options de requête invalides.');
      }
  
      // Compter le nombre total d'entités
      return await this.getRepository().count(options);
    } catch (error) {
      console.error('Erreur dans getTotalCount:', error);
      throw new Error('Erreur lors du comptage des entités.');
    }
  }
  /**
   * Supprime une entité par son ID.
   */
  public async delete(id: string | number): Promise<void> {
    await this.getRepository().delete(id);
  }

  /**
   * Supprime une entité de manière logicielle (soft delete).
   */
  public async softDelete(id: string | number): Promise<T> {
    const entity = await this.findOneById(id);
    if (!entity) {
      throw new Error(`Entity with ID ${id} not found.`);
    }
    await this.getRepository().softDelete(id);
    return entity;
  }

  /**
   * Supprime plusieurs entités de manière logicielle (soft delete).
   */
  public async softDeleteMany(ids: (string | number)[]): Promise<T[]> {
    const options: FindManyOptions<T> = {
     // where: { id: In(ids) } as FindOptionsWhere<T>,
    };

    const entities = await this.findAll(options);

    await Promise.all(
      ids.map(async (id) => {
        await this.getRepository().softDelete(id);
      }),
    );

    return entities;
  }

  /**
   * Met à jour les associations entre entités.
   */
  public async updateAssociations<U extends { id?: number | string }>({
    existingItems,
    updatedItems,
    onDelete,
    onCreate,
  }: {
    existingItems: U[];
    updatedItems: U[];
    onDelete: (id: number | string) => Promise<any>;
    onCreate: (item: any) => Promise<any>;
  }): Promise<{
    keptItems: U[];
    newItems: any[];
    eliminatedItems: any[];
  }> {
    const newItems = [];
    const keptItems = [];
    const eliminatedItems = [];

    // Identifier les éléments supprimés et conservés
    for (const existingItem of existingItems) {
      const existsInUpdate = updatedItems.some(
        (updatedItem) => updatedItem.id === existingItem.id,
      );
      if (!existsInUpdate) {
        eliminatedItems.push(await onDelete(existingItem.id));
      } else {
        keptItems.push(existingItem);
      }
    }

    // Identifier les nouveaux éléments
    for (const updatedItem of updatedItems) {
      if (!updatedItem.id) {
        newItems.push(await onCreate(updatedItem));
      }
    }

    return {
      keptItems,
      newItems,
      eliminatedItems,
    };
  }

  /**
   * Met à jour les associations entre entités avec des clés spécifiques.
   */
  async updateAssociations2<U extends Record<string, any>>({
    existingItems,
    updatedItems,
    keys,
    onDelete,
    onCreate,
  }: {
    existingItems: U[];
    updatedItems: U[];
    keys: [keyof U, keyof U];
    onCreate: (item: U) => Promise<any>;
    onDelete: (id: number) => Promise<any>;
  }): Promise<{
    keptItems: U[];
    newItems: U[];
    eliminatedItems: U[];
  }> {
    const newItems: U[] = [];
    const keptItems: U[] = [];
    const eliminatedItems: U[] = [];

    const [key1, key2] = keys;

    const isSameCombination = (a: U, b: U) =>
      a[key1] === b[key1] && a[key2] === b[key2];

    // Identifier les éléments supprimés et conservés
    for (const existingItem of existingItems) {
      const existsInUpdate = updatedItems.some((updatedItem) =>
        isSameCombination(updatedItem, existingItem),
      );
      if (!existsInUpdate) {
        eliminatedItems.push(await onDelete(existingItem.id));
      } else {
        keptItems.push(existingItem);
      }
    }

    // Identifier les nouveaux éléments
    for (const updatedItem of updatedItems) {
      const existsInExisting = existingItems.some((existingItem) =>
        isSameCombination(updatedItem, existingItem),
      );
      if (!existsInExisting) {
        newItems.push(await onCreate(updatedItem));
      }
    }

    return {
      keptItems,
      newItems,
      eliminatedItems,
    };
  }

  /**
   * Supprime toutes les entités de la base de données.
   */
  public async deleteAll(): Promise<void> {
    await this.getRepository().clear();
  }
}