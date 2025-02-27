import { Injectable } from '@nestjs/common';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { Transactional } from '@nestjs-cls/transactional';
import { CurrencyService } from 'src/modules/currency/services/currency.service';
import { ExpensePaymentRepository } from '../repositories/repository/expense-payment-file.entity';
import { ExpensePaymentInvoiceEntryService } from './expense-payment-invoice-entry.service';
import { ExpensePaymentUploadService } from './expense-payment-upload.service';
import { ExpenseInvoiceService } from 'src/modules/expense-invoice/services/expense-invoice.service';
import { ExpensePaymentEntity } from '../repositories/entities/expense-payment.entity';
import { ExpensePaymentNotFoundException } from '../errors/expense-payment.notfound.error';
import { ResponseExpensePaymentDto } from '../dtos/expense-payment.response.dto';
import { ResponseExpensePaymentUploadDto } from '../dtos/expense-payment-upload.response.dto';
import { UpdateExpensePaymentDto } from '../dtos/expense-payment.update.dto';
import { CreatePaymentDto } from 'src/modules/payment/dtos/payment.create.dto';
import { ExpenseCreatePaymentDto } from '../dtos/expense-payment.create.dto';

@Injectable()
export class ExpensePaymentService {
  constructor(
    private readonly expenesePaymentRepository: ExpensePaymentRepository,
    private readonly expensePaymentInvoiceEntryService: ExpensePaymentInvoiceEntryService,
    private readonly expensePaymentUploadService: ExpensePaymentUploadService,
    private readonly expenseInvoiceService: ExpenseInvoiceService,
    private readonly currencyService: CurrencyService,
  ) {}

  async findOneById(id: number): Promise<ExpensePaymentEntity> {
    const expensePayment = await this.expenesePaymentRepository.findOneById(id);
    if (!expensePayment) {
      throw new ExpensePaymentNotFoundException();
    }
    return expensePayment;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseExpensePaymentDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const payment = await this.expenesePaymentRepository.findOne(
      queryOptions as FindOneOptions<ExpensePaymentEntity>,
    );
    if (!payment) return null;
    return payment;
  }

  async findAll(query: IQueryObject): Promise<ResponseExpensePaymentDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.expenesePaymentRepository.findAll(
      queryOptions as FindManyOptions<ExpensePaymentEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseExpensePaymentDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.expenesePaymentRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.expenesePaymentRepository.findAll(
      queryOptions as FindManyOptions<ExpensePaymentEntity>,
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
async save(createPaymentDto: ExpenseCreatePaymentDto): Promise<ExpensePaymentEntity> {
  try {
    console.log('Saving payment...', createPaymentDto);

    // Sauvegarder le paiement
    const payment = await this.expenesePaymentRepository.save(createPaymentDto);
    console.log('Payment saved:', payment);

    // Récupérer la devise associée
    const currency = await this.currencyService.findOneById(payment.currencyId);
    console.log('Currency found:', currency);

    // Traiter les entrées de facture
    const invoiceEntries = await Promise.all(
      createPaymentDto.invoices.map(async (entry) => {
        console.log('Processing invoice entry:', entry);
        const invoice = await this.expenseInvoiceService.findOneById(entry.expenseInvoiceId);
        console.log('Invoice found:', invoice);
        return {
          paymentId: payment.id,
          invoiceId: entry.expenseInvoiceId,
          amount: entry.amountPaid * (invoice.currencyId !== payment.currencyId ? payment.convertionRate : 1),
          digitAfterComma: currency.digitAfterComma,
        };
      }),
    );
    console.log('Invoice entries processed:', invoiceEntries);

    // Sauvegarder les entrées de facture
    await this.expensePaymentInvoiceEntryService.saveMany(invoiceEntries);
    console.log('Invoice entries saved');

    // Gérer les téléchargements de fichiers s'ils existent
    if (createPaymentDto.uploads) {
      console.log('Processing uploads:', createPaymentDto.uploads);
      await Promise.all(
        createPaymentDto.uploads.map((u) =>
          this.expensePaymentUploadService.save(payment.id, u.uploadId),
        ),
      );
      console.log('Uploads processed');
    }

    return payment;
  } catch (error) {
    console.error('Error in save method:', error);
    throw new Error('Failed to save expense payment');
  }
}

@Transactional()
async update(
  id: number,
  updatePaymentDto: UpdateExpensePaymentDto,
): Promise<ExpensePaymentEntity> {
  // Récupérer le paiement existant
  const existingPayment = await this.findOneByCondition({
    filter: `id||$eq||${id}`,
    join: 'invoices,uploads',
  });

  // Vérifier si le paiement existe
  if (!existingPayment) {
    throw new Error(`Payment with ID ${id} not found`);
  }

  // Initialiser `uploads` avec un tableau vide si non défini
  const uploads = updatePaymentDto.uploads || [];

  // Soft delete existing invoice entries
  await this.expensePaymentInvoiceEntryService.softDeleteMany(
    existingPayment.invoices.map((entry) => entry.id),
  );

  // Handle uploads - manage existing, new, and eliminated uploads
  const {
    keptItems: keptUploads,
    newItems: newUploads,
    eliminatedItems: eliminatedUploads,
  } = await this.expenesePaymentRepository.updateAssociations({
    updatedItems: uploads, // Utiliser `uploads` initialisé
    existingItems: existingPayment.uploads,
    onDelete: (id: number) => this.expensePaymentUploadService.softDelete(id),
    onCreate: (entity: ResponseExpensePaymentUploadDto) =>
      this.expensePaymentUploadService.save(entity.expensePaymentId, entity.uploadId),
  });

  // Save the updated payment
  const payment = await this.expenesePaymentRepository.save({
    ...existingPayment,
    ...updatePaymentDto,
    uploads: [...keptUploads, ...newUploads, ...eliminatedUploads],
  });

  // Fetch the currency for conversion
  const currency = await this.currencyService.findOneById(payment.currencyId);

  // Process and save new invoice entries
  const invoiceEntries = await Promise.all(
    updatePaymentDto.invoices.map(async (entry) => {
      const invoice = await this.expenseInvoiceService.findOneById(entry.expenseInvoiceId);
      return {
        paymentId: payment.id,
        invoiceId: entry.expenseInvoiceId,
        amount:
          entry.amountPaid *
          (invoice.currencyId !== payment.currencyId ? payment.convertionRate : 1),
        digitAfterComma: currency.digitAfterComma,
      };
    }),
  );

  await this.expensePaymentInvoiceEntryService.saveMany(invoiceEntries);

  return payment;
}  @Transactional()
  async softDelete(id: number): Promise<ExpensePaymentEntity> {
    const existingPayment = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'invoices',
    });
    await this.expensePaymentInvoiceEntryService.softDeleteMany(
      existingPayment.invoices.map((invoice) => invoice.id),
    );
    return this.expenesePaymentRepository.softDelete(id);
  }

  async deleteAll() {
    return this.expenesePaymentRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.expenesePaymentRepository.getTotalCount();
  }
}
