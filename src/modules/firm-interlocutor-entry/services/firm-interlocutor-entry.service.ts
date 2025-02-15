import { Injectable } from '@nestjs/common';
import { FirmInterlocutorEntryRepository } from '../repositories/repository/firm-interlocutor-entry.repository';
import { ResponseFirmInterlocutorEntryDto } from '../dtos/firm-interlocutor-entry.response.dto';
import { FirmInterlocutorEntryNotFoundException } from '../errors/firm-interlocutor-entry.notfound.error';
import { CreateFirmInterlocutorEntryDto } from '../dtos/firm-interlocutor-entry.create.dto';
import { FirmInterlocutorEntryEntity } from '../repositories/entities/firm-interlocutor-entry.entity';
import { UpdateFirmInterlocutorEntryDto } from '../dtos/firm-interlocutor-entry.update.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindOneOptions } from 'typeorm';

@Injectable()
export class FirmInterlocutorEntryService {
  constructor(
    private readonly firmInterlocutorEntryRepository: FirmInterlocutorEntryRepository,
  ) {}

  async findOneById(id: number): Promise<ResponseFirmInterlocutorEntryDto> {
    const entry = await this.firmInterlocutorEntryRepository.findOneById(id);
    if (!entry) {
      throw new FirmInterlocutorEntryNotFoundException();
    }
    return entry;
  }

  async findAllByInterlocutorId(
    interlocutorId: number,
  ): Promise<ResponseFirmInterlocutorEntryDto[]> {
    const entry = await this.firmInterlocutorEntryRepository.findAll({
      where: { interlocutorId },
    });
    return entry;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseFirmInterlocutorEntryDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const entry = await this.firmInterlocutorEntryRepository.findOne(
      queryOptions as FindOneOptions<FirmInterlocutorEntryEntity>,
    );
    if (!entry) return null;
    return entry;
  }

  async save(
    createFirmInterlocutorEntryDto: CreateFirmInterlocutorEntryDto,
  ): Promise<FirmInterlocutorEntryEntity> {
    const existing = await this.firmInterlocutorEntryRepository.findByCondition(
      {
        where: {
          firmId: createFirmInterlocutorEntryDto.firmId,
          interlocutorId: createFirmInterlocutorEntryDto.interlocutorId,
        },
      },
    );

    if (existing) {
      return await this.firmInterlocutorEntryRepository.save({
        ...existing,
        ...createFirmInterlocutorEntryDto,
      });
    }

    return await this.firmInterlocutorEntryRepository.save(
      createFirmInterlocutorEntryDto,
    );
  }

  async saveMany(
    createFirmInterlocutorEntryDtos: CreateFirmInterlocutorEntryDto[],
  ): Promise<FirmInterlocutorEntryEntity[]> {
    const savedEntries = [];
    for (const dto of createFirmInterlocutorEntryDtos) {
      const savedEntry = await this.save(dto);
      savedEntries.push(savedEntry);
    }
    return savedEntries;
  }

  async update(
    id: number,
    updateFirmInterlocutorEntryDto: UpdateFirmInterlocutorEntryDto,
  ): Promise<FirmInterlocutorEntryEntity> {
    const existingEntry =
      await this.firmInterlocutorEntryRepository.findByCondition({
        where: { id },
      });
    return await this.firmInterlocutorEntryRepository.save({
      ...existingEntry,
      ...updateFirmInterlocutorEntryDto,
    });
  }

  async updatePosition(id: number, position: string): Promise<boolean> {
    const result = await this.firmInterlocutorEntryRepository.update(id, {
      position,
    });
    return result.affected === 1;
  }

  async updateMany(
    updateFirmInterlocutorEntryDtos: UpdateFirmInterlocutorEntryDto[],
  ): Promise<FirmInterlocutorEntryEntity[]> {
    const savedEntries = [];
    for (const dto of updateFirmInterlocutorEntryDtos) {
      const savedEntry = await this.save(dto);
      savedEntries.push(savedEntry);
    }
    return savedEntries;
  }

  async softDelete(id: number): Promise<FirmInterlocutorEntryEntity> {
    await this.findOneById(id);
    return this.firmInterlocutorEntryRepository.softDelete(id);
  }

  async softDeleteByFirmIdAndInterlocutorId(
    firmId: number,
    interlocutorId: number,
  ): Promise<FirmInterlocutorEntryEntity> {
    const entry = await this.findOneByCondition({
      filter: `firmId||$eq||${firmId};interlocutorId||$eq||${interlocutorId}`,
    });
    return this.firmInterlocutorEntryRepository.softDelete(entry.id);
  }

  async softDeleteMany(ids: number[]): Promise<void> {
    for (const id in ids) {
      await this.softDelete(ids[id]);
    }
  }
}
