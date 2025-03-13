import { Injectable, NotFoundException } from '@nestjs/common';
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
import { StorageService } from 'src/common/storage/services/storage.service';

@Injectable()
export class ExpensePaymentService {
  constructor(
    private readonly expenesePaymentRepository: ExpensePaymentRepository,
    private readonly expensePaymentInvoiceEntryService: ExpensePaymentInvoiceEntryService,
    private readonly expensePaymentUploadService: ExpensePaymentUploadService,
    private readonly expenseInvoiceService: ExpenseInvoiceService,
    private readonly currencyService: CurrencyService,
    private readonly storageService: StorageService,
    
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

  async save(createPaymentDto: ExpenseCreatePaymentDto): Promise<ExpensePaymentEntity> {
    try {
      console.log('Saving payment...', createPaymentDto);
  
      // Générer ou valider le numéro séquentiel
      const sequentialNumbr = createPaymentDto.sequentialNumbr || await this.generateSequentialNumber();
      console.log('Sequential Number (Backend):', sequentialNumbr);
  
      // Vérifier le format du numéro séquentiel
      if (!/^PAY-\d+$/.test(sequentialNumbr)) {
        throw new Error('Invalid payment number format. Expected format: PAY-XXXX');
      }
  
      // Récupérer le fichier PDF si pdfFileId est fourni
      let uploadPdfField = null;
      if (createPaymentDto.pdfFileId) {
        uploadPdfField = await this.storageService.findOneById(createPaymentDto.pdfFileId);
        if (!uploadPdfField) {
          throw new NotFoundException('Uploaded PDF file not found');
        }
      }
  
      // Sauvegarder le paiement avec le numéro séquentiel et le fichier PDF
      const payment = await this.expenesePaymentRepository.save({
        ...createPaymentDto,
        sequential: sequentialNumbr, // Assigner sequentialNumbr à sequential
        sequentialNumbr, // Conserver sequentialNumbr
        pdfFileId: uploadPdfField ? uploadPdfField.id : null,
        uploadPdfField: uploadPdfField ? uploadPdfField : null,
      });
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
            expenseInvoiceId: entry.expenseInvoiceId,
            amount: entry.amount * (invoice.currencyId !== payment.currencyId ? payment.convertionRate : 1),
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
      throw new Error(`Failed to save expense payment: ${error.message}`);
    }
  }

// Méthode pour générer un numéro séquentiel
private async generateSequentialNumber(): Promise<string> {
  const lastPayment = await this.expenesePaymentRepository.findOne({
    where: {}, // Condition vide pour récupérer la dernière entité
    order: { id: 'DESC' },
  });

  if (!lastPayment || !lastPayment.sequentialNumbr) {
    // Si la table est vide ou si sequentialNumbr est null/undefined, commencez à partir de 1
    return 'PAY-1';
  }

  // Extraire le numéro de sequentialNumbr (par exemple, "PAY-123" -> 123)
  const lastNumber = parseInt(lastPayment.sequentialNumbr.split('-')[1], 10);
  if (isNaN(lastNumber)) {
    // Si le format de sequentialNumbr est invalide, commencez à partir de 1
    return 'PAY-1';
  }

  return `PAY-${lastNumber + 1}`;
}

// Dans votre service backend (expensquotation.service.ts)
async deletePdfFile(paymentId: number): Promise<void> {
  const payment = await this.expenesePaymentRepository.findOneById(paymentId);
  if (!payment) {
    throw new Error("Quotation not found");
  }

  if (payment.pdfFileId) {
    // Supprimer le fichier PDF de la base de données
    await this.storageService.delete(payment.pdfFileId);

    // Mettre à jour le devis pour retirer l'ID du fichier PDF
    await this.expenesePaymentRepository.save({
      ...payment,
      pdfFileId: null,
      uploadPdfField: null,
    });
  }
}


@Transactional()
async update(
  id: number,
  updatePaymentDto: UpdateExpensePaymentDto,
): Promise<ExpensePaymentEntity> {
  try {
    console.log('Updating payment...', updatePaymentDto);

    // Récupérer le paiement existant
    const existingPayment = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'invoices,uploads,uploadPdfField',
    });

    // Vérifier si le paiement existe
    if (!existingPayment) {
      throw new Error(`Payment with ID ${id} not found`);
    }

    // Vérifier et valider le numéro séquentiel
    const sequentialNumbr = updatePaymentDto.sequentialNumbr || existingPayment.sequentialNumbr;
    if (!/^PAY-\d+$/.test(sequentialNumbr)) {
      throw new Error('Invalid payment number format. Expected format: PAY-XXXX');
    }

    // Récupérer le fichier PDF si pdfFileId est fourni
    let uploadPdfField = null;
    if (updatePaymentDto.pdfFileId) {
      uploadPdfField = await this.storageService.findOneById(updatePaymentDto.pdfFileId);
      if (!uploadPdfField) {
        throw new NotFoundException('Uploaded PDF file not found');
      }
    }

    // Soft delete existing invoice entries
    await this.expensePaymentInvoiceEntryService.softDeleteMany(
      existingPayment.invoices.map((entry) => entry.id),
    );

    // Gérer les uploads
    const uploads = updatePaymentDto.uploads || [];
    const {
      keptItems: keptUploads,
      newItems: newUploads,
      eliminatedItems: eliminatedUploads,
    } = await this.expenesePaymentRepository.updateAssociations({
      updatedItems: uploads,
      existingItems: existingPayment.uploads,
      onDelete: (id: number) => this.expensePaymentUploadService.softDelete(id),
      onCreate: (entity: ResponseExpensePaymentUploadDto) =>
        this.expensePaymentUploadService.save(entity.expensePaymentId, entity.uploadId),
    });

    // Sauvegarder le paiement mis à jour
    const payment = await this.expenesePaymentRepository.save({
      ...existingPayment,
      ...updatePaymentDto,
      sequential: sequentialNumbr, // Assigner sequentialNumbr à sequential
      sequentialNumbr, // Conserver sequentialNumbr
      pdfFileId: uploadPdfField ? uploadPdfField.id : existingPayment.pdfFileId,
      uploadPdfField: uploadPdfField ? uploadPdfField : existingPayment.pdfFileId,
      uploads: [...keptUploads, ...newUploads, ...eliminatedUploads],
    });

    // Récupérer la devise associée
    const currency = await this.currencyService.findOneById(payment.currencyId);

    // Traiter et sauvegarder les nouvelles entrées de facture
    const invoiceEntries = await Promise.all(
      updatePaymentDto.invoices.map(async (entry) => {
        const invoice = await this.expenseInvoiceService.findOneById(entry.expenseInvoiceId);
        return {
          paymentId: payment.id,
          expenseInvoiceId: entry.expenseInvoiceId,
          amount:
            entry.amount *
            (invoice.currencyId !== payment.currencyId ? payment.convertionRate : 1),
          digitAfterComma: currency.digitAfterComma,
        };
      }),
    );

    await this.expensePaymentInvoiceEntryService.saveMany(invoiceEntries);

    console.log('Payment updated:', payment);
    return payment;
  } catch (error) {
    console.error('Error in update method:', error);
    throw new Error(`Failed to update expense payment: ${error.message}`);
  }
}
@Transactional()
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
