import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { StorageService } from 'src/common/storage/services/storage.service';
import { InvoiceUploadRepository } from '../repositories/repository/invoice-upload.repository';
import { InvoiceUploadEntity } from '../repositories/entities/invoice-file.entity';
import { InvoiceUploadNotFoundException } from '../errors/invoice-upload.notfound';

@Injectable()
export class InvoiceUploadService {
  constructor(
    private readonly invoiceUploadRepository: InvoiceUploadRepository,
    private readonly storageService: StorageService,
  ) {}

  async findOneById(id: number): Promise<InvoiceUploadEntity> {
    const upload = await this.invoiceUploadRepository.findOneById(id);
    if (!upload) {
      throw new InvoiceUploadNotFoundException();
    }
    return upload;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<InvoiceUploadEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const upload = await this.invoiceUploadRepository.findOne(
      queryOptions as FindOneOptions<InvoiceUploadEntity>,
    );
    if (!upload) return null;
    return upload;
  }

  async findAll(query: IQueryObject): Promise<InvoiceUploadEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.invoiceUploadRepository.findAll(
      queryOptions as FindManyOptions<InvoiceUploadEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<InvoiceUploadEntity>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.invoiceUploadRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.invoiceUploadRepository.findAll(
      queryOptions as FindManyOptions<InvoiceUploadEntity>,
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
    invoiceId: number,
    uploadId: number,
  ): Promise<InvoiceUploadEntity> {
    return this.invoiceUploadRepository.save({ invoiceId, uploadId });
  }

  async duplicate(id: number, invoiceId: number): Promise<InvoiceUploadEntity> {
    //Find the original invoice upload entity
    const originalInvoiceUpload = await this.findOneById(id);

    //Use the StorageService to duplicate the file
    const duplicatedUpload = await this.storageService.duplicate(
      originalInvoiceUpload.uploadId,
    );

    //Save the duplicated InvoiceUploadEntity
    const duplicatedInvoiceUpload = await this.invoiceUploadRepository.save({
      invoiceId: invoiceId,
      uploadId: duplicatedUpload.id,
    });

    return duplicatedInvoiceUpload;
  }

  async duplicateMany(
    ids: number[],
    invoiceId: number,
  ): Promise<InvoiceUploadEntity[]> {
    const duplicatedInvoiceUploads = await Promise.all(
      ids.map((id) => this.duplicate(id, invoiceId)),
    );
    return duplicatedInvoiceUploads;
  }

  async softDelete(id: number): Promise<InvoiceUploadEntity> {
    const upload = await this.findOneById(id);
    this.storageService.delete(upload.uploadId);
    this.invoiceUploadRepository.softDelete(upload.id);
    return upload;
  }

  async softDeleteMany(
    invoiceUploadEntities: InvoiceUploadEntity[],
  ): Promise<InvoiceUploadEntity[]> {
    this.storageService.deleteMany(
      invoiceUploadEntities.map((qu) => qu.upload.id),
    );
    return this.invoiceUploadRepository.softDeleteMany(
      invoiceUploadEntities.map((qu) => qu.id),
    );
  }

  async deleteAll() {
    return this.invoiceUploadRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.invoiceUploadRepository.getTotalCount();
  }
}
