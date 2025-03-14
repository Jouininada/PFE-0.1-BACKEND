import { Injectable, NotFoundException, StreamableFile } from "@nestjs/common";
import { ExpenseInvoiceRepository } from "../repositories/repository/expense-invoice.repository";
import { ExpenseArticleInvoiceEntryService } from "./expense-article-invoice-entry.service";
import { ExpenseInvoiceUploadService } from "./expense-invoice-upload.service";
import { BankAccountService } from "src/modules/bank-account/services/bank-account.service";
import { CurrencyService } from "src/modules/currency/services/currency.service";
import { FirmService } from "src/modules/firm/services/firm.service";
import { InterlocutorService } from "src/modules/interlocutor/services/interlocutor.service";
import { ExpenseInvoiceMetaDataService } from "./expense-invoice-meta-data.service";
import { TaxService } from "src/modules/tax/services/tax.service";
import { TaxWithholdingService } from "src/modules/tax-withholding/services/tax-withholding.service";
import { InvoicingCalculationsService } from "src/common/calculations/services/invoicing.calculations.service";
import { PdfService } from "src/common/pdf/services/pdf.service";
import { format } from "date-fns";
import { ExpenseInvoiceNotFoundException } from "../errors/expense-invoice.notfound.error";
import { ExpenseInvoiceEntity } from "../repositories/entities/expense-invoice.entity";
import { IQueryObject } from "src/common/database/interfaces/database-query-options.interface";
import { QueryBuilder } from "src/common/database/utils/database-query-builder";
import { FindManyOptions, FindOneOptions, UpdateResult } from "typeorm";
import { PageDto } from "src/common/database/dtos/database.page.dto";
import { ExpenseResponseInvoiceDto } from "../dtos/expense-invoice.response.dto";
import { PageMetaDto } from "src/common/database/dtos/database.page-meta.dto";
import { Transactional } from "@nestjs-cls/transactional";
import { ExpenseCreateInvoiceDto } from "../dtos/expense-invoice-create.dto";
import { EXPENSE_INVOICE_STATUS } from "../enums/expense-invoice-status.enum";
import { ExpenseUpdateInvoiceDto } from "../dtos/expense-invoice.update.dto";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { ExpenseDuplicateInvoiceDto } from "../dtos/expense-invoice.duplicate.dto";
import { ExpensQuotationEntity } from "src/modules/expense_quotation/repositories/entities/expensquotation.entity";
import { StorageService } from "src/common/storage/services/storage.service";
import { ExpenseResponseInvoiceUploadDto } from "../dtos/expense-invoice-upload.response.dto";

@Injectable()
export class ExpenseInvoiceService {
  constructor(
    //repositories
    private readonly invoiceRepository: ExpenseInvoiceRepository,
    //entity services
    private readonly articleInvoiceEntryService: ExpenseArticleInvoiceEntryService,
    private readonly invoiceUploadService: ExpenseInvoiceUploadService,
    private readonly bankAccountService: BankAccountService,
    private readonly currencyService: CurrencyService,
    private readonly firmService: FirmService,
    private readonly interlocutorService: InterlocutorService,
    private readonly invoiceMetaDataService: ExpenseInvoiceMetaDataService,
    private readonly taxService: TaxService,
    private readonly taxWithholdingService: TaxWithholdingService,
    private readonly storageService: StorageService,

    //abstract services
    private readonly calculationsService: InvoicingCalculationsService,
    private readonly pdfService: PdfService,
  ) {}
 
  async findOneById(id: number): Promise<ExpenseInvoiceEntity> {
    const invoice = await this.invoiceRepository.findOneById(id);
    if (!invoice) {
      throw new ExpenseInvoiceNotFoundException();
    }
    return invoice;
  }

  async findOneByCondition(
    query: IQueryObject = {},
  ): Promise<ExpenseInvoiceEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const invoice = await this.invoiceRepository.findByCondition(
      queryOptions as FindOneOptions<ExpenseInvoiceEntity>,
    );
    if (!invoice) return null;
    return invoice;
  }

  async findAll(query: IQueryObject = {}): Promise<ExpenseInvoiceEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.invoiceRepository.findAll(
      queryOptions as FindManyOptions<ExpenseInvoiceEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ExpenseResponseInvoiceDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.invoiceRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.invoiceRepository.findAll(
      queryOptions as FindManyOptions<ExpenseInvoiceEntity>,
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
async save(createInvoiceDto: ExpenseCreateInvoiceDto): Promise<ExpenseInvoiceEntity> {
  const [firm, bankAccount, currency] = await Promise.all([
    this.firmService.findOneByCondition({
      filter: `id||$eq||${createInvoiceDto.firmId}`,
    }),
    createInvoiceDto.bankAccountId
      ? this.bankAccountService.findOneById(createInvoiceDto.bankAccountId)
      : Promise.resolve(null),
    createInvoiceDto.currencyId
      ? this.currencyService.findOneById(createInvoiceDto.currencyId)
      : Promise.resolve(null),
  ]);

  if (!firm) {
    throw new Error('Firm not found');
  }

  await this.interlocutorService.findOneById(createInvoiceDto.interlocutorId);

  const articleEntries =
    createInvoiceDto.articleInvoiceEntries &&
    (await this.articleInvoiceEntryService.saveMany(
      createInvoiceDto.articleInvoiceEntries,
    ));

  if (!articleEntries) {
    throw new Error('Article entries are missing');
  }

  const { subTotal, total } =
    this.calculationsService.calculateLineItemsTotal(
      articleEntries.map((entry) => entry.total),
      articleEntries.map((entry) => entry.subTotal),
    );

  const taxStamp = createInvoiceDto.taxStampId
    ? await this.taxService.findOneById(createInvoiceDto.taxStampId)
    : null;

  const totalAfterGeneralDiscount =
    this.calculationsService.calculateTotalDiscount(
      total,
      createInvoiceDto.discount,
      createInvoiceDto.discount_type,
      taxStamp?.value || 0,
    );

  const lineItems = await this.articleInvoiceEntryService.findManyAsLineItem(
    articleEntries.map((entry) => entry.id),
  );

  const taxSummary = await Promise.all(
    this.calculationsService
      .calculateTaxSummary(lineItems)
      .map(async (item) => {
        const tax = await this.taxService.findOneById(item.taxId);
        return {
          ...item,
          label: tax.label,
          value: tax.isRate ? tax.value * 100 : tax.value,
          isRate: tax.isRate,
        };
      }),
  );

  // ✅ Vérifier et générer le numéro séquentiel
  let sequentialNumbr = createInvoiceDto.sequentialNumbr || await this.generateSequentialNumber();
  console.log('Sequential Number (Backend):', sequentialNumbr);

  if (!/^INV-\d+$/.test(sequentialNumbr)) {
    throw new Error('Invalid invoice number format. Expected format: INV-XXXX');
  }

  const invoiceMetaData = await this.invoiceMetaDataService.save({
    ...createInvoiceDto.invoiceMetaData,
    taxSummary,
  });

  let taxWithholdingAmount = 0;
  if (createInvoiceDto.taxWithholdingId) {
    const taxWithholding = await this.taxWithholdingService.findOneById(
      createInvoiceDto.taxWithholdingId,
    );

    if (taxWithholding.rate !== undefined && taxWithholding.rate !== null) {
      taxWithholdingAmount =
        totalAfterGeneralDiscount * (taxWithholding.rate / 100);
    }
  }

  let uploadPdfField = null;
  if (createInvoiceDto.pdfFileId) {
    uploadPdfField = await this.storageService.findOneById(
      createInvoiceDto.pdfFileId,
    );
    if (!uploadPdfField) {
      throw new NotFoundException('Uploaded PDF file not found');
    }
  }

  const invoice = await this.invoiceRepository.save({
    ...createInvoiceDto,
    sequential: sequentialNumbr,
    bankAccountId: bankAccount ? bankAccount.id : null,
    currencyId: currency ? currency.id : firm.currencyId,
    cabinetId: 1,
    sequentialNumbr,
    articleExpenseEntries: articleEntries,
    expenseInvoiceMetaData: invoiceMetaData,
    subTotal,
    taxWithholdingAmount: taxWithholdingAmount || 0,
    total: totalAfterGeneralDiscount,
    uploadPdfField: uploadPdfField ? uploadPdfField.id : null,
  });

  if (createInvoiceDto.uploads) {
    await Promise.all(
      createInvoiceDto.uploads.map((u) =>
        this.invoiceUploadService.save(invoice.id, u.uploadId),
      ),
    );
  }
  return invoice;
}

/**
 * ✅ Fonction pour générer un numéro séquentiel au format INV-XXXX
 */
private async generateSequentialNumber(): Promise<string> {
  const lastInvoice = await this.invoiceRepository.findOne({
    order: { id: 'DESC' },
  });

  const lastNumber = lastInvoice?.sequentialNumbr
    ? parseInt(lastInvoice.sequentialNumbr.split('-')[1], 10)
    : 0;

  return `INV-${lastNumber + 1}`;
}



  async saveMany(
    createInvoiceDtos: ExpenseCreateInvoiceDto[],
  ): Promise<ExpenseInvoiceEntity[]> {
    const invoices = [];
    for (const createInvoiceDto of createInvoiceDtos) {
      const invoice = await this.save(createInvoiceDto);
      invoices.push(invoice);
    }
    return invoices;
  }

  @Transactional()
  async saveFromQuotation(quotation: ExpensQuotationEntity): Promise<ExpenseInvoiceEntity> {
    return this.save({
      quotationId: quotation.id,
      currencyId: quotation.currencyId,
      bankAccountId: quotation.bankAccountId,
      interlocutorId: quotation.interlocutorId,
      firmId: quotation.firmId,
      discount: quotation.discount,
      discount_type: quotation.discount_type,
      object: quotation.object,
      status: EXPENSE_INVOICE_STATUS.Draft,
      date: new Date(),
      dueDate: null,
      articleInvoiceEntries: quotation.expensearticleQuotationEntries.map((entry) => {
        return {
          unit_price: entry.unit_price,
          quantity: entry.quantity,
          discount: entry.discount,
          discount_type: entry.discount_type,
          subTotal: entry.subTotal,
          total: entry.total,
          articleId: entry.article.id,
          article: entry.article,
          taxes: entry.articleExpensQuotationEntryTaxes.map((entry) => {
            return entry.taxId;
          }),
        };
      }),
    });
  }

  async update(
    id: number,
    updateInvoiceDto: ExpenseUpdateInvoiceDto,
  ): Promise<ExpenseInvoiceEntity> {
    // Récupérer l'invoice existante
    const existingInvoice = await this.invoiceRepository.findOne({ where: { id } });
    if (!existingInvoice) {
      throw new Error('Invoice not found');
    }
  
    // Log des IDs des fichiers reçus du frontend
    console.log('PDF File ID reçu du frontend:', updateInvoiceDto.pdfFileId);
    console.log('IDs des fichiers supplémentaires reçus du frontend:', updateInvoiceDto.uploads?.map(u => u.uploadId));
  
    // Récupérer les fichiers uploadés existants sous forme de tableau
    const existingUploadEntities = await this.invoiceUploadService.findByInvoiceId(id);
  
    // Mapper les entités vers des DTOs
    const existingUploads = existingUploadEntities.map((upload) => ({
      id: upload.id,
      uploadId: upload.uploadId,
      // Ajoutez d'autres propriétés nécessaires ici
    }));
  
    // Gérer les fichiers uploadés
    const { keptUploads, newUploads, eliminatedUploads } = await this.updateExpenseInvoiceUpload(
      id,
      updateInvoiceDto,
      existingUploads,
    );
  
    // Logique pour récupérer ou conserver le numéro séquentiel existant
    const sequentialNumbr = updateInvoiceDto.sequentialNumbr || existingInvoice.sequentialNumbr || null;
   
  
  
    // Si tu as des validations supplémentaires à faire (ex : vérifier firm, bankAccount, etc.)
    const [firm, bankAccount, currency] = await Promise.all([
      this.firmService.findOneByCondition({
        filter: `id||$eq||${updateInvoiceDto.firmId}`,
      }),
      updateInvoiceDto.bankAccountId
        ? this.bankAccountService.findOneById(updateInvoiceDto.bankAccountId)
        : Promise.resolve(null),
      updateInvoiceDto.currencyId
        ? this.currencyService.findOneById(updateInvoiceDto.currencyId)
        : Promise.resolve(null),
    ]);
  
    if (!firm) {
      throw new Error('Firm not found');
    }
  
    // Récupérer les autres données nécessaires (comme les entrées d'articles, calculs, etc.)
    const articleEntries =
      updateInvoiceDto.articleInvoiceEntries &&
      (await this.articleInvoiceEntryService.saveMany(
        updateInvoiceDto.articleInvoiceEntries,
      ));
  
    if (!articleEntries) {
      throw new Error('Article entries are missing');
    }
  
    const { subTotal, total } =
      this.calculationsService.calculateLineItemsTotal(
        articleEntries.map((entry) => entry.total),
        articleEntries.map((entry) => entry.subTotal),
      );
  
    const taxStamp = updateInvoiceDto.taxStampId
      ? await this.taxService.findOneById(updateInvoiceDto.taxStampId)
      : null;
  
    const totalAfterGeneralDiscount =
      this.calculationsService.calculateTotalDiscount(
        total,
        updateInvoiceDto.discount,
        updateInvoiceDto.discount_type,
        taxStamp?.value || 0,
      );
  
    const lineItems = await this.articleInvoiceEntryService.findManyAsLineItem(
      articleEntries.map((entry) => entry.id),
    );
  
    const taxSummary = await Promise.all(
      this.calculationsService
        .calculateTaxSummary(lineItems)
        .map(async (item) => {
          const tax = await this.taxService.findOneById(item.taxId);
          return {
            ...item,
            label: tax.label,
            value: tax.isRate ? tax.value * 100 : tax.value,
            isRate: tax.isRate,
          };
        }),
    );
  
    // Utilise le sequentialNumbr dans l'insertion de la facture
    const invoiceMetaData = await this.invoiceMetaDataService.save({
      ...updateInvoiceDto.invoiceMetaData,
      taxSummary,
    });
  
    let taxWithholdingAmount = 0;
    if (updateInvoiceDto.taxWithholdingId) {
      const taxWithholding = await this.taxWithholdingService.findOneById(
        updateInvoiceDto.taxWithholdingId,
      );
  
      if (taxWithholding.rate !== undefined && taxWithholding.rate !== null) {
        taxWithholdingAmount =
          totalAfterGeneralDiscount * (taxWithholding.rate / 100);
      }
    }
  
    // ✅ Gestion du fichier PDF
    let pdfFileId = existingInvoice.pdfFileId; // Conserver l'ID du fichier PDF existant par défaut
  
    // Si un nouveau fichier PDF est fourni, mettre à jour l'ID
    if (updateInvoiceDto.pdfFileId) {
      console.log('PDF File ID reçu du frontend:', updateInvoiceDto.pdfFileId); // Vérifiez l'ID du fichier PDF
      pdfFileId = updateInvoiceDto.pdfFileId;
    }
  
    // Mettre à jour la facture avec le même numéro séquentiel ou un nouveau
    const updatedInvoice = await this.invoiceRepository.save({
      ...updateInvoiceDto,
      sequential: sequentialNumbr, // Assurez-vous de passer sequentialNumbr ici
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      cabinetId: 1,
      sequentialNumbr, // Utilisez sequentialNumbr ici
      articleExpenseEntries: articleEntries,
      expenseInvoiceMetaData: invoiceMetaData,
      subTotal,
      taxWithholdingAmount: taxWithholdingAmount || 0,
      total: totalAfterGeneralDiscount,
      pdfFileId, // Inclure l'ID du fichier PDF (nouveau ou existant)
    });
  
    // Gestion des fichiers uploadés
    if (updateInvoiceDto.uploads) {
      console.log('Uploads reçus du frontend:', updateInvoiceDto.uploads); // Vérifiez les fichiers uploadés
      await Promise.all(
        updateInvoiceDto.uploads.map((u) => {
          console.log('Upload ID:', u.uploadId); // Vérifiez chaque ID de fichier uploadé
          return this.invoiceUploadService.save(updatedInvoice.id, u.uploadId);
        }),
      );
    }
  
    console.log('Updated Invoice:', updatedInvoice); // Vérifiez la facture mise à jour
    return updatedInvoice;
  }
  async updateExpenseInvoiceUpload(
    id: number,
    updateInvoiceDto: ExpenseUpdateInvoiceDto,
    existingUploads: ExpenseResponseInvoiceUploadDto[], // Renommer le type pour correspondre au contexte
  ) {
    const newUploads = [];
    const keptUploads = [];
    const eliminatedUploads = [];
  
    if (updateInvoiceDto.uploads) {
        try {
            // Gestion des fichiers existants
            for (const upload of existingUploads) {
                const exists = updateInvoiceDto.uploads.some(
                    (u) => u.uploadId === upload.uploadId, // Utiliser uploadId pour la correspondance
                );
                if (!exists) {
                    console.log(`Suppression du fichier avec l'uploadId ${upload.uploadId}`);
                    const deletedUpload = await this.invoiceUploadService.softDelete(upload.id); // Suppression douce
                    eliminatedUploads.push(deletedUpload);
                } else {
                    keptUploads.push(upload); // Conserver le fichier existant
                }
            }
  
            // Ajout des nouveaux fichiers
            for (const upload of updateInvoiceDto.uploads) {
                if (!upload.id) { // Vérifier si c'est un nouveau fichier
                    console.log(`Ajout d'un nouveau fichier avec l'uploadId ${upload.uploadId}`);
                    const newUpload = await this.invoiceUploadService.save(id, upload.uploadId); // Enregistrer le nouveau fichier
                    newUploads.push(newUpload);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour des fichiers uploadés :', error);
            throw new Error('Erreur lors de la mise à jour des fichiers uploadés');
        }
    }
  
    // Log des fichiers conservés, ajoutés et supprimés
    console.log('Fichiers conservés:', keptUploads);
    console.log('Nouveaux fichiers ajoutés:', newUploads);
    console.log('Fichiers supprimés:', eliminatedUploads);
  
    return {
        keptUploads, // Fichiers conservés
        newUploads, // Nouveaux fichiers ajoutés
        eliminatedUploads, // Fichiers supprimés
    };
  }
  async updateFields(
    id: number,
    dict: QueryDeepPartialEntity<ExpenseInvoiceEntity>,
  ): Promise<UpdateResult> {
    return this.invoiceRepository.update(id, dict);
  }

  async duplicate(duplicateInvoiceDto: ExpenseDuplicateInvoiceDto): Promise<ExpenseResponseInvoiceDto> {
    // Récupérer la facture existante
    const existingInvoice = await this.findOneByCondition({
      filter: `id||$eq||${duplicateInvoiceDto.id}`,
      join: 'expenseInvoiceMetaData,articleExpenseEntries,articleExpenseEntries.expenseArticleInvoiceEntryTaxes,uploads,uploadPdfField',
    });
  
    if (!existingInvoice) {
      throw new Error(`Invoice with id ${duplicateInvoiceDto.id} not found`);
    }
  
    // Dupliquer les métadonnées de la facture
    const invoiceMetaData = await this.invoiceMetaDataService.duplicate(
      existingInvoice.expenseInvoiceMetaData.id,
    );
  
    // Exclure 'id', 'sequential' et 'sequentialNumbr' avant de dupliquer
    const { id, sequential, sequentialNumbr, ...invoiceData } = existingInvoice;
  
    // Créer une nouvelle facture sans les fichiers pour l'instant
    const invoice = await this.invoiceRepository.save({
      ...invoiceData, // Copie tout sauf 'id', 'sequential' et 'sequentialNumbr'
      id: undefined, // Nouvelle facture sans l'ID original
      sequential: null, // Ne pas conserver l'ancien numéro séquentiel
      sequentialNumbr: null, // Ne pas copier sequentialNumbr
      expenseInvoiceMetaData: invoiceMetaData,
      articleExpenseEntries: [], // Les articles seront dupliqués plus tard
      uploads: [], // Les uploads seront dupliqués plus tard
      amountPaid: 0, // Réinitialiser le montant payé
      status: EXPENSE_INVOICE_STATUS.Draft, // Statut de la nouvelle facture
    });
  
    // Dupliquer les articles si nécessaire
    if (existingInvoice.articleExpenseEntries?.length > 0) {
      const articleInvoiceEntries = await this.articleInvoiceEntryService.duplicateMany(
        existingInvoice.articleExpenseEntries.map((entry) => entry.id),
        invoice.id,
      );
      invoice.articleExpenseEntries = articleInvoiceEntries;
    }
  
    // Gérer les fichiers joints uniquement si includeFiles est true
    let uploads = [];
    if (duplicateInvoiceDto.includeFiles && existingInvoice.uploads) {
      const uploadIds = existingInvoice.uploads.map((upload) => upload.id);
      uploads = await this.invoiceUploadService.duplicateMany(uploadIds, invoice.id);
    }
  
    // Gérer le fichier PDF uniquement si includeFiles est true
    let uploadPdfField = null;
    if (duplicateInvoiceDto.includeFiles && existingInvoice.uploadPdfField) {
      const existingPdfFile = await this.storageService.findOneById(existingInvoice.uploadPdfField.id);
      if (!existingPdfFile) {
        throw new Error('Existing PDF file not found');
      }
      const duplicatedPdfFile = await this.storageService.duplicate(existingPdfFile.id);
      uploadPdfField = duplicatedPdfFile.id; // Récupérer l'ID du fichier PDF dupliqué
    }
  
    // Associer les fichiers dupliqués (uploads et PDF) à la nouvelle facture
    return this.invoiceRepository.save({
      ...invoice,
      uploads,
      uploadPdfField: uploadPdfField ? uploadPdfField : null, // Associer le fichier PDF dupliqué
    });
  }

  async updateMany(
    updateInvoiceDtos: ExpenseUpdateInvoiceDto[],
  ): Promise<ExpenseInvoiceEntity[]> {
    return this.invoiceRepository.updateMany(updateInvoiceDtos);
  }
  async deletePdfFile(invoiceId: number): Promise<void> {
    const invoice = await this.invoiceRepository.findOneById(invoiceId);
    if (!invoice) {
      throw new Error("Quotation not found");
    }
  
    if (invoice.pdfFileId) {
      // Supprimer le fichier PDF de la base de données
      await this.storageService.delete(invoice.pdfFileId);
  
      // Mettre à jour le devis pour retirer l'ID du fichier PDF
      await this.invoiceRepository.save({
        ...invoice,
        pdfFileId: null,
        uploadPdfField: null,
      });
    }
  }


  async softDelete(id: number): Promise<ExpenseInvoiceEntity> {
    await this.findOneById(id);
    return this.invoiceRepository.softDelete(id);
  }

  async deleteAll() {
    return this.invoiceRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.invoiceRepository.getTotalCount();
  }
  async updateInvoiceStatusIfExpired(invoiceId: number): Promise<ExpenseInvoiceEntity> {
    const invoice = await this.findOneById(invoiceId);
    const currentDate = new Date();
    const dueDate = new Date(invoice.dueDate);
  
    if (dueDate < currentDate && invoice.status !== EXPENSE_INVOICE_STATUS.Expired) {
      invoice.status = EXPENSE_INVOICE_STATUS.Expired;
      return this.invoiceRepository.save(invoice);
    }
  
    return invoice;
  }
}




