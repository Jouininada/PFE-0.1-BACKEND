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
  
    // ✅ Récupérer le numéro séquentiel correct
    const sequentialNumbr = createInvoiceDto.sequentialNumbr || null;
    console.log('Sequential Number (Backend):', createInvoiceDto.sequentialNumbr);
  
    // Utilisez sequentialNumbr dans l'insertion de la facture
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
  
    // ✅ Modifier l'insertion de la facture avec le numéro séquentiel
    const invoice = await this.invoiceRepository.save({
      ...createInvoiceDto,
      sequential: sequentialNumbr,  // Assurez-vous de passer sequentialNumbr ici
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      cabinetId: 1,
      sequentialNumbr, // Utilisez sequentialNumbr ici
      articleExpenseEntries: articleEntries,
      expenseInvoiceMetaData: invoiceMetaData,
      subTotal,
      taxWithholdingAmount: taxWithholdingAmount || 0,
      total: totalAfterGeneralDiscount,
    });
  
    if (createInvoiceDto.uploads) {
      await Promise.all(
        createInvoiceDto.uploads.map((u) =>
          this.invoiceUploadService.save(invoice.id, u.uploadId,u.filePath),
        ),
      );
    }
    return invoice;
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

  @Transactional()
async update(
  id: number,
  updateInvoiceDto: ExpenseUpdateInvoiceDto,
): Promise<ExpenseInvoiceEntity> {
  // Récupérer l'invoice existante
  const existingInvoice = await this.invoiceRepository.findOne({ where: { id } });
  if (!existingInvoice) {
    throw new Error('Invoice not found');
  }

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
  });

  if (updateInvoiceDto.uploads) {
    await Promise.all(
      updateInvoiceDto.uploads.map((u) =>
        this.invoiceUploadService.save(updatedInvoice.id, u.uploadId,u.filePath),
      ),
    );
  }

  return updatedInvoice;
}
  async updateFields(
    id: number,
    dict: QueryDeepPartialEntity<ExpenseInvoiceEntity>,
  ): Promise<UpdateResult> {
    return this.invoiceRepository.update(id, dict);
  }

  async duplicate(duplicateInvoiceDto: ExpenseDuplicateInvoiceDto): Promise<ExpenseResponseInvoiceDto> {
    const existingInvoice = await this.findOneByCondition({
        filter: `id||$eq||${duplicateInvoiceDto.id}`,
        join: 'expenseInvoiceMetaData,articleExpenseEntries,articleExpenseEntries.expenseArticleInvoiceEntryTaxes,uploads',
    });

    if (!existingInvoice) {
        throw new Error(`Invoice with id ${duplicateInvoiceDto.id} not found`);
    }

    const articleExpenseEntries = existingInvoice.articleExpenseEntries || [];
    const invoiceMetaData = await this.invoiceMetaDataService.duplicate(
        existingInvoice.expenseInvoiceMetaData.id,
    );

    // ✅ Exclure 'sequential' et 'sequentialNumbr' avant de dupliquer
    const { id, sequential, sequentialNumbr, ...invoiceData } = existingInvoice;

    const invoice = await this.invoiceRepository.save({
        ...invoiceData, // Copie tout sauf 'id', 'sequential' et 'sequentialNumbr'
        id: undefined, // Nouvelle facture sans l'ID original
        sequential: null, // Ne pas conserver l'ancien numéro séquentiel
        sequentialNumbr: null, // Ne pas copier sequentialNumbr
        expenseInvoiceMetaData: invoiceMetaData,
        articleExpenseEntries: [],
        uploads: [],
        amountPaid: 0,
        status: EXPENSE_INVOICE_STATUS.Draft,
    });

    // ✅ Dupliquer les articles si nécessaire
    if (articleExpenseEntries.length > 0) {
        const articleInvoiceEntries = await this.articleInvoiceEntryService.duplicateMany(
            articleExpenseEntries.map((entry) => entry.id),
            invoice.id,
        );
        invoice.articleExpenseEntries = articleInvoiceEntries;
    }

    // ✅ Gérer les fichiers joints
    const uploads = duplicateInvoiceDto.includeFiles
        ? await this.invoiceUploadService.duplicateMany(
            existingInvoice.uploads?.map((upload) => upload.id) || [],
            invoice.id,
        )
        : [];

    return this.invoiceRepository.save({
        ...invoice,
        uploads,
    });
}


  async updateMany(
    updateInvoiceDtos: ExpenseUpdateInvoiceDto[],
  ): Promise<ExpenseInvoiceEntity[]> {
    return this.invoiceRepository.updateMany(updateInvoiceDtos);
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
}




