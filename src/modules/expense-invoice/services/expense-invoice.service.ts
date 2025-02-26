import { Injectable, StreamableFile } from "@nestjs/common";
import { ExpenseInvoiceRepository } from "../repositories/repository/expense-invoice.repository";
import { ExpenseArticleInvoiceEntryService } from "./expense-article-invoice-entry.service";
import { ExpenseInvoiceUploadService } from "./expense-invoice-upload.service";
import { BankAccountService } from "src/modules/bank-account/services/bank-account.service";
import { CurrencyService } from "src/modules/currency/services/currency.service";
import { FirmService } from "src/modules/firm/services/firm.service";
import { InterlocutorService } from "src/modules/interlocutor/services/interlocutor.service";
import { ExpenseInvoiceSequenceService } from "./expense-invoice-sequence.service";
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
import { ExpenseResponseInvoiceRangeDto } from "../dtos/expense-invoice-range.response.dto";
import { parseSequential } from "src/utils/sequence.utils";
import { Transactional } from "@nestjs-cls/transactional";
import { ExpenseCreateInvoiceDto } from "../dtos/expense-invoice-create.dto";
import { EXPENSE_INVOICE_STATUS } from "../enums/expense-invoice-status.enum";
import { ExpenseUpdateInvoiceDto } from "../dtos/expense-invoice.update.dto";
import { ExpenseArticleInvoiceEntryEntity } from "../repositories/entities/expense-article-invoice-entry.entity";
import { ciel } from "src/utils/number.utils";
import { ExpenseResponseInvoiceUploadDto } from "../dtos/expense-invoice-upload.response.dto";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { ExpenseDuplicateInvoiceDto } from "../dtos/expense-invoice.duplicate.dto";
import { ExpenseUpdateInvoiceSequenceDto } from "../dtos/expense-invoice-sequence.update.dto";
import { ExpenseInvoiceSequence } from "../interfaces/expense-invoice-sequence.interface";
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
    private readonly invoiceSequenceService: ExpenseInvoiceSequenceService,
    private readonly invoiceMetaDataService: ExpenseInvoiceMetaDataService,
    private readonly taxService: TaxService,
    private readonly taxWithholdingService: TaxWithholdingService,

    //abstract services
    private readonly calculationsService: InvoicingCalculationsService,
    private readonly pdfService: PdfService,
  ) {}

  async downloadPdf(id: number, template: string): Promise<StreamableFile> {
    const invoice = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: new String().concat(
        'firm,',
        'cabinet,',
        'currency,',
        'bankAccount,',
        'interlocutor,',
        'cabinet.address,',
        'expenseInvoiceMetaData,',
        'firm.deliveryAddress,',
        'firm.invoicingAddress,',
        'articleExpenseEntries,',
        'articleExpenseEntries.article,',
        'articleExpenseEntries.expenseArticleInvoiceEntryTaxes,',  // Corrigé ici
        'articleExpenseEntries.expenseArticleInvoiceEntryTaxes.tax'  // Corrigé ici
      ),
    });
  
    const digitsAferComma = invoice.currency.digitAfterComma;
    if (invoice) {
      const data = {
        meta: {
          ...invoice.expenseInvoiceMetaData,
          type: 'DEVIS',
        },
        invoice: {
          ...invoice,
          date: format(invoice.date, 'dd/MM/yyyy'),
          dueDate: format(invoice.dueDate, 'dd/MM/yyyy'),
          taxSummary: invoice.expenseInvoiceMetaData.taxSummary,
          subTotal: invoice.subTotal.toFixed(digitsAferComma),
          total: invoice.total.toFixed(digitsAferComma),
        },
      };
  
      const pdfBuffer = await this.pdfService.generatePdf(data, template);
      return new StreamableFile(pdfBuffer);
    } else {
      throw new ExpenseInvoiceNotFoundException();
    }
  }  

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

  async findInvoicesByRange(id: number): Promise<ExpenseResponseInvoiceRangeDto> {
    // Get the current sequential
    const currentSequential = await this.invoiceSequenceService.get();
    const lastSequence = currentSequential.value.next - 1;

    // fetch the invoice
    const invoice = await this.findOneById(id);
    const { next } = parseSequential(invoice.sequential);

    // determine the previous and next invoices
    const previousInvoice =
      next != 1
        ? await this.findOneByCondition({
            filter: `sequential||$ends||${next - 1}`,
          })
        : null;

    const nextInvoice =
      next != lastSequence
        ? await this.findOneByCondition({
            filter: `sequential||$ends||${next + 1}`,
          })
        : null;

    return {
      next: nextInvoice,
      previous: previousInvoice,
    };
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
  const sequentialNumbr = createInvoiceDto.sequentialNumbr || '';


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

  // ✅ Modifier l'insertion de la facture avec `sequentialNumber`
  const invoice = await this.invoiceRepository.save({
    ...createInvoiceDto,
    bankAccountId: bankAccount ? bankAccount.id : null,
    currencyId: currency ? currency.id : firm.currencyId,
    cabinetId: 1,
    sequentialNumbr:sequentialNumbr, // 🟢 Changer ici
    articleExpenseEntries: articleEntries,
    expenseInvoiceMetaData: invoiceMetaData,
    subTotal,
    taxWithholdingAmount: taxWithholdingAmount || 0,
    total: totalAfterGeneralDiscount,
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
          unit_price: entry.unitPrice,
          quantity: entry.quantity,
          discount: entry.discount,
          discount_type: entry.discountType,
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
    // Retrieve the existing invoice with necessary relations
    const { uploads: existingUploads, ...existingInvoice } =
      await this.findOneByCondition({
        filter: `id||$eq||${id}`,
        join: 'articleExpenseEntries,expenseInvoiceMetaData,uploads,taxWithholding',
      });

    // Fetch and validate related entities
    const [firm, bankAccount, currency, interlocutor] = await Promise.all([
      this.firmService.findOneByCondition({
        filter: `id||$eq||${updateInvoiceDto.firmId}`,
      }),
      updateInvoiceDto.bankAccountId
        ? this.bankAccountService.findOneById(updateInvoiceDto.bankAccountId)
        : null,
      updateInvoiceDto.currencyId
        ? this.currencyService.findOneById(updateInvoiceDto.currencyId)
        : null,
      updateInvoiceDto.interlocutorId
        ? this.interlocutorService.findOneById(updateInvoiceDto.interlocutorId)
        : null,
    ]);

    // Soft delete old article entries to prepare for new ones
    const existingArticles =
      await this.articleInvoiceEntryService.softDeleteMany(
        existingInvoice.articleExpenseEntries.map((entry) => entry.id),
      );

    // Save new article entries
    const articleEntries: ExpenseArticleInvoiceEntryEntity[] =
      updateInvoiceDto.articleInvoiceEntries
        ? await this.articleInvoiceEntryService.saveMany(
            updateInvoiceDto.articleInvoiceEntries,
          )
        : existingArticles;

    // Calculate the subtotal and total for the new entries
    const { subTotal, total } =
      this.calculationsService.calculateLineItemsTotal(
        articleEntries.map((entry) => entry.total),
        articleEntries.map((entry) => entry.subTotal),
      );

    // Fetch tax stamp if provided
    const taxStamp = updateInvoiceDto.taxStampId
      ? await this.taxService.findOneById(updateInvoiceDto.taxStampId)
      : null;

    // Apply general discount
    const totalAfterGeneralDiscount =
      this.calculationsService.calculateTotalDiscount(
        total,
        updateInvoiceDto.discount,
        updateInvoiceDto.discount_type,
        taxStamp?.value || 0,
      );

    // Convert 
    //  entries to line items for further calculations
    const lineItems = await this.articleInvoiceEntryService.findManyAsLineItem(
      articleEntries.map((entry) => entry.id),
    );

    // Calculate tax summary (handle both percentage and fixed taxes)
    const taxSummary = await Promise.all(
      this.calculationsService
        .calculateTaxSummary(lineItems)
        .map(async (item) => {
          const tax = await this.taxService.findOneById(item.taxId);

          return {
            ...item,
            label: tax.label,
            // Check if the tax is rate-based or a fixed amount
            rate: tax.isRate ? tax.value * 100 : tax.value, // handle both types
            isRate: tax.isRate,
          };
        }),
    );

    // Save or update the invoice metadata with the updated tax summary
    const invoiceMetaData = await this.invoiceMetaDataService.save({
      ...existingInvoice.expenseInvoiceMetaData,
      ...updateInvoiceDto.invoiceMetaData,
      taxSummary,
    });

    // Ensure taxWithholding.rate is valid and calculate the withholding amount
    let taxWithholdingAmount = 0;
    if (updateInvoiceDto.taxWithholdingId) {
      const taxWithholding = await this.taxWithholdingService.findOneById(
        updateInvoiceDto.taxWithholdingId,
      );

      if (taxWithholding.rate !== undefined && taxWithholding.rate !== null) {
        taxWithholdingAmount = ciel(
          totalAfterGeneralDiscount * (taxWithholding.rate / 100),
          currency.digitAfterComma + 1,
        );
      }
    }

    // Handle uploads - manage existing, new, and eliminated uploads
    const {
      keptItems: keptUploads,
      newItems: newUploads,
      eliminatedItems: eliminatedUploads,
    } = await this.invoiceRepository.updateAssociations({
      updatedItems: updateInvoiceDto.uploads,
      existingItems: existingUploads,
      onDelete: (id: number) => this.invoiceUploadService.softDelete(id),
      onCreate: (entity: ExpenseResponseInvoiceUploadDto) =>
        this.invoiceUploadService.save(entity.invoiceId, entity.uploadId),
    });

    // Save and return the updated invoice with all updated details
    return this.invoiceRepository.save({
      ...updateInvoiceDto,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      interlocutorId: interlocutor ? interlocutor.id : null,
      articleExpenseEntries: articleEntries,
      expenseInvoiceMetaData: invoiceMetaData,
      taxStampId: taxStamp ? taxStamp.id : null,
      subTotal,
      taxWithholdingAmount,
      total: totalAfterGeneralDiscount,
      uploads: [...keptUploads, ...newUploads, ...eliminatedUploads],
    });
  }

  async updateFields(
    id: number,
    dict: QueryDeepPartialEntity<ExpenseInvoiceEntity>,
  ): Promise<UpdateResult> {
    return this.invoiceRepository.update(id, dict);
  }

  async duplicate(
    duplicateInvoiceDto: ExpenseDuplicateInvoiceDto,
  ): Promise<ExpenseResponseInvoiceDto> {
    const existingInvoice = await this.findOneByCondition({
      filter: `id||$eq||${duplicateInvoiceDto.id}`,
      join: 'expenseInvoiceMetaData,articleExpenseEntries,articleExpenseEntries.expenseArticleInvoiceEntryTaxes,uploads',
    });
  
    if (!existingInvoice) {
      throw new Error(`Invoice with id ${duplicateInvoiceDto.id} not found`);
    }
  
    if (!existingInvoice.expenseInvoiceMetaData) {
      throw new Error(`InvoiceMetaData is missing for invoice id ${duplicateInvoiceDto.id}`);
    }
  
    const articleExpenseEntries = existingInvoice.articleExpenseEntries || [];
    const invoiceMetaData = await this.invoiceMetaDataService.duplicate(
      existingInvoice.expenseInvoiceMetaData.id,
    );
  
    // 🔹 Récupération du dernier `sequentialNumbr`
    const lastInvoice = await this.invoiceRepository.findOne({
      order: { sequentialNumbr: 'DESC' as any },
    });
  
    let sequentialNumbr = lastInvoice?.sequentialNumbr
      ? (parseInt(lastInvoice.sequentialNumbr, 10) + 1).toString()
      : '1';
  
    // 🔹 Vérification de l'unicité de `sequentialNumbr`
    if (sequentialNumbr) {
      while (await this.invoiceRepository.findOne({ where: { sequentialNumbr } })) {
        sequentialNumbr = (parseInt(sequentialNumbr, 10) + 1).toString();
      }
    }
  
    const invoice = await this.invoiceRepository.save({
      ...existingInvoice,
      id: undefined,
      sequentialNumbr,
      expenseInvoiceMetaData: invoiceMetaData,
      articleExpenseEntries: [],
      uploads: [],
      amountPaid: 0,
      status: EXPENSE_INVOICE_STATUS.Draft,
    });
  
    if (articleExpenseEntries.length > 0) {
      const articleInvoiceEntries = await this.articleInvoiceEntryService.duplicateMany(
        articleExpenseEntries.map((entry) => entry.id),
        invoice.id,
      );
      invoice.articleExpenseEntries = articleInvoiceEntries;
    }
  
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

  async updateInvoiceSequence(
    updatedSequenceDto: ExpenseUpdateInvoiceSequenceDto,
  ): Promise<ExpenseInvoiceSequence> {
    return (await this.invoiceSequenceService.set(updatedSequenceDto)).value;
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
