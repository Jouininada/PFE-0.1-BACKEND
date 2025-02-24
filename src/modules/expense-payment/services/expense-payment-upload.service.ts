import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { StorageService } from 'src/common/storage/services/storage.service';
import { ExpensePaymentUploadRepository } from '../repositories/repository/expense-payment.repository';
import { ExpensePaymentUploadEntity } from '../repositories/entities/expense-payment-file.entity';
import { ExpensePaymentUploadNotFoundException } from '../errors/expense-payment-upload.notfound.error';

@Injectable()
export class ExpensePaymentUploadService {
  constructor(
    private readonly expensePaymentUploadRepository: ExpensePaymentUploadRepository,
    private readonly storageService: StorageService,
  ) {}

  async findOneById(id: number): Promise<ExpensePaymentUploadEntity> {
    const upload = await this.expensePaymentUploadRepository.findOneById(id);
    if (!upload) {
      throw new ExpensePaymentUploadNotFoundException();
    }
    return upload;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ExpensePaymentUploadEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const upload = await this.expensePaymentUploadRepository.findOne(
      queryOptions as FindOneOptions<ExpensePaymentUploadEntity>,
    );
    if (!upload) return null;
    return upload;
  }

  async findAll(query: IQueryObject): Promise<ExpensePaymentUploadEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.expensePaymentUploadRepository.findAll(
      queryOptions as FindManyOptions<ExpensePaymentUploadEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ExpensePaymentUploadEntity>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.expensePaymentUploadRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.expensePaymentUploadRepository.findAll(
      queryOptions as FindManyOptions<ExpensePaymentUploadEntity>,
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
    paymentId: number,
    uploadId: number,
  ): Promise<ExpensePaymentUploadEntity> {
    return this.expensePaymentUploadRepository.save({
      expensePaymentId: paymentId,  // Corrected the usage here
      uploadId,
    });
  }

  async duplicate(id: number, paymentId: number): Promise<ExpensePaymentUploadEntity> {
    // Find the original payment upload entity
    const originalPaymentUpload = await this.findOneById(id);

    // Use the StorageService to duplicate the file
    const duplicatedUpload = await this.storageService.duplicate(
      originalPaymentUpload.uploadId,
    );

    // Save the duplicated PaymentUploadEntity
    const duplicatedPaymentUpload = await this.expensePaymentUploadRepository.save({
      expensePaymentId: paymentId,  // Corrected the usage here
      uploadId: duplicatedUpload.id,
    });

    return duplicatedPaymentUpload;
  }

  async duplicateMany(
    ids: number[],
    paymentId: number,
  ): Promise<ExpensePaymentUploadEntity[]> {
    const duplicatedPaymentUploads = await Promise.all(
      ids.map((id) => this.duplicate(id, paymentId)),
    );
    return duplicatedPaymentUploads;
  }

  async softDelete(id: number): Promise<ExpensePaymentUploadEntity> {
    const upload = await this.findOneById(id);
    this.storageService.delete(upload.uploadId);
    this.expensePaymentUploadRepository.softDelete(upload.id);
    return upload;
  }

  async softDeleteMany(
    quotationUploadEntities: ExpensePaymentUploadEntity[],
  ): Promise<ExpensePaymentUploadEntity[]> {
    this.storageService.deleteMany(
      quotationUploadEntities.map((qu) => qu.upload.id),
    );
    return this.expensePaymentUploadRepository.softDeleteMany(
      quotationUploadEntities.map((qu) => qu.id),
    );
  }

  async deleteAll() {
    return this.expensePaymentUploadRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.expensePaymentUploadRepository.getTotalCount();
  }
}
