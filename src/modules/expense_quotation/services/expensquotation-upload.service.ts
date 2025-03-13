/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ExpensQuotationUploadEntity } from '../repositories/entities/expensquotation-file.entity';
import { QuotationUploadNotFoundException } from '../errors/quotation-upload.notfound';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { StorageService } from 'src/common/storage/services/storage.service';
import { ExpensQuotationUploadRepository } from '../repositories/repository/expensquotation-upload.repository';

@Injectable()
export class ExpensQuotationUploadService {
  constructor(
    private readonly quotationUploadRepository: ExpensQuotationUploadRepository,
    private readonly storageService: StorageService,
  ) {}

  
  async findOneById(id: number): Promise<ExpensQuotationUploadEntity> {
    const upload = await this.quotationUploadRepository.findOneById(id);
    if (!upload) {
      throw new QuotationUploadNotFoundException();
    }
    return upload;
  }


  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ExpensQuotationUploadEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const upload = await this.quotationUploadRepository.findOne(
      queryOptions as FindOneOptions<ExpensQuotationUploadEntity>,
    );
    if (!upload) return null;
    return upload;
  }


  
  async findAll(query: IQueryObject): Promise<ExpensQuotationUploadEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.quotationUploadRepository.findAll(
      queryOptions as FindManyOptions<ExpensQuotationUploadEntity>,
    );
  }


  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ExpensQuotationUploadEntity>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.quotationUploadRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.quotationUploadRepository.findAll(
      queryOptions as FindManyOptions<ExpensQuotationUploadEntity>,
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
    expensequotationId: number,
    uploadId: number,
  ): Promise<ExpensQuotationUploadEntity> {
    return this.quotationUploadRepository.save({ expensequotationId, uploadId });
  }



  async duplicate(
    id: number,
    quotationId: number,
  ): Promise<ExpensQuotationUploadEntity> {
    //Find the original quotation upload entity
    const originalQuotationUpload = await this.findOneById(id);

    //Use the StorageService to duplicate the file
    const duplicatedUpload = await this.storageService.duplicate(
      originalQuotationUpload.uploadId,


    );

    //Save the duplicated QuotationUploadEntity
    const duplicatedQuotationUpload = await this.quotationUploadRepository.save(
      {
        expensequotationId: quotationId,
        uploadId: duplicatedUpload.id,
      },
    );

    return duplicatedQuotationUpload;
  }

  async softDelete(id: number): Promise<ExpensQuotationUploadEntity> {
    const upload = await this.findOneById(id);
    this.storageService.delete(upload.uploadId);
    this.quotationUploadRepository.softDelete(upload.id);
    return upload;
  }

  async duplicateMany(
    ids: number[],
    quotationId: number,
  ): Promise<ExpensQuotationUploadEntity[]> {
    const duplicatedQuotationUploads = await Promise.all(
      ids.map((id) => this.duplicate(id, quotationId)),
    );
    return duplicatedQuotationUploads;
  }


  async softDeleteMany(
    quotationUploadEntities: ExpensQuotationUploadEntity[],
  ): Promise<ExpensQuotationUploadEntity[]> {
    this.storageService.deleteMany(
      quotationUploadEntities.map((qu) => qu.upload.id),
    );
    return this.quotationUploadRepository.softDeleteMany(
      quotationUploadEntities.map((qu) => qu.id),
    );
  }

  async deleteAll() {
    return this.quotationUploadRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.quotationUploadRepository.getTotalCount();
  }
}

