import { Injectable } from '@nestjs/common';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { PaymentRepository } from '../repositories/repository/payment-file.entity';
import { PaymentEntity } from '../repositories/entities/payment.entity';
import { PaymentNotFoundException } from '../errors/payment.notfound.error';
import { ResponsePaymentDto } from '../dtos/payment.response.dto';
import { CreatePaymentDto } from '../dtos/payment.create.dto';
import { UpdatePaymentDto } from '../dtos/payment.update.dto';
import { InvoiceService } from 'src/modules/invoice/services/invoice.service';
import { Transactional } from '@nestjs-cls/transactional';
import { PaymentInvoiceEntryService } from './payment-invoice-entry.service';
import { CurrencyService } from 'src/modules/currency/services/currency.service';
import { PaymentUploadService } from './payment-upload.service';
import { ResponsePaymentUploadDto } from '../dtos/payment-upload.response.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentInvoiceEntryService: PaymentInvoiceEntryService,
    private readonly paymentUploadService: PaymentUploadService,
    private readonly invoiceService: InvoiceService,
    private readonly currencyService: CurrencyService,
  ) {}

  async findOneById(id: number): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findOneById(id);
    if (!payment) {
      throw new PaymentNotFoundException();
    }
    return payment;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponsePaymentDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const payment = await this.paymentRepository.findOne(
      queryOptions as FindOneOptions<PaymentEntity>,
    );
    if (!payment) return null;
    return payment;
  }

  async findAll(query: IQueryObject): Promise<ResponsePaymentDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.paymentRepository.findAll(
      queryOptions as FindManyOptions<PaymentEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponsePaymentDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.paymentRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.paymentRepository.findAll(
      queryOptions as FindManyOptions<PaymentEntity>,
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
  async save(createPaymentDto: CreatePaymentDto): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.save(createPaymentDto);
    const currency = await this.currencyService.findOneById(payment.currencyId);
    const invoiceEntries = await Promise.all(
      createPaymentDto.invoices.map(async (entry) => {
        const invoice = await this.invoiceService.findOneById(entry.invoiceId);
        return {
          paymentId: payment.id,
          invoiceId: entry.invoiceId,
          amount:
            entry.amount *
            (invoice.currencyId !== payment.currencyId
              ? payment.convertionRate
              : 1),
          digitAfterComma: currency.digitAfterComma,
        };
      }),
    );
    await this.paymentInvoiceEntryService.saveMany(invoiceEntries);
    // Handle file uploads if they exist
    if (createPaymentDto.uploads) {
      await Promise.all(
        createPaymentDto.uploads.map((u) =>
          this.paymentUploadService.save(payment.id, u.uploadId),
        ),
      );
    }
    return payment;
  }

  @Transactional()
  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentEntity> {
    const existingPayment = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'invoices,uploads',
    });
    await this.paymentInvoiceEntryService.softDeleteMany(
      existingPayment.invoices.map((entry) => entry.id),
    );

    // Handle uploads - manage existing, new, and eliminated uploads
    const {
      keptItems: keptUploads,
      newItems: newUploads,
      eliminatedItems: eliminatedUploads,
    } = await this.paymentRepository.updateAssociations({
      updatedItems: updatePaymentDto.uploads,
      existingItems: existingPayment.uploads,
      onDelete: (id: number) => this.paymentUploadService.softDelete(id),
      onCreate: (entity: ResponsePaymentUploadDto) =>
        this.paymentUploadService.save(entity.paymentId, entity.uploadId),
    });

    const payment = await this.paymentRepository.save({
      ...existingPayment,
      ...updatePaymentDto,
      uploads: [...keptUploads, ...newUploads, ...eliminatedUploads],
    });

    const currency = await this.currencyService.findOneById(payment.currencyId);

    const invoiceEntries = await Promise.all(
      updatePaymentDto.invoices.map(async (entry) => {
        const invoice = await this.invoiceService.findOneById(entry.invoiceId);
        return {
          paymentId: payment.id,
          invoiceId: entry.invoiceId,
          amount:
            entry.amount *
            (invoice.currencyId !== payment.currencyId
              ? payment.convertionRate
              : 1),
          digitAfterComma: currency.digitAfterComma,
        };
      }),
    );

    await this.paymentInvoiceEntryService.saveMany(invoiceEntries);

    return payment;
  }

  @Transactional()
  async softDelete(id: number): Promise<PaymentEntity> {
    const existingPayment = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'invoices',
    });
    await this.paymentInvoiceEntryService.softDeleteMany(
      existingPayment.invoices.map((invoice) => invoice.id),
    );
    return this.paymentRepository.softDelete(id);
  }

  async deleteAll() {
    return this.paymentRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.paymentRepository.getTotalCount();
  }
}
