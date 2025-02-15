import { Injectable, StreamableFile } from '@nestjs/common';
import { QuotationRepository } from '../repositories/repository/quotation.repository';
import { QuotationEntity } from '../repositories/entities/quotation.entity';
import { QuotationNotFoundException } from '../errors/quotation.notfound.error';
import { ResponseQuotationDto } from '../dtos/quotation.response.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { CreateQuotationDto } from '../dtos/quotation.create.dto';
import { UpdateQuotationDto } from '../dtos/quotation.update.dto';
import { CurrencyService } from 'src/modules/currency/services/currency.service';
import { FirmService } from 'src/modules/firm/services/firm.service';
import { InterlocutorService } from 'src/modules/interlocutor/services/interlocutor.service';
import { InvoicingCalculationsService } from 'src/common/calculations/services/invoicing.calculations.service';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { ArticleQuotationEntryService } from './article-quotation-entry.service';
import { ArticleQuotationEntryEntity } from '../repositories/entities/article-quotation-entry.entity';
import { PdfService } from 'src/common/pdf/services/pdf.service';
import { format, isAfter } from 'date-fns';
import { QuotationSequenceService } from './quotation-sequence.service';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { QuotationMetaDataService } from './quotation-meta-data.service';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { BankAccountService } from 'src/modules/bank-account/services/bank-account.service';
import { QuotationUploadService } from './quotation-upload.service';
import { ResponseQuotationUploadDto } from '../dtos/quotation-upload.response.dto';
import { QuotationSequence } from '../interfaces/quotation-sequence.interface';
import { UpdateQuotationSequenceDto } from '../dtos/quotation-seqence.update.dto';
import { Transactional } from '@nestjs-cls/transactional';
import { DuplicateQuotationDto } from '../dtos/quotation.duplicate.dto';
import { QUOTATION_STATUS } from '../enums/quotation-status.enum';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class QuotationService {
  constructor(
    //repositories
    private readonly quotationRepository: QuotationRepository,
    //entity services
    private readonly articleQuotationEntryService: ArticleQuotationEntryService,
    private readonly quotationUploadService: QuotationUploadService,
    private readonly bankAccountService: BankAccountService,
    private readonly currencyService: CurrencyService,
    private readonly firmService: FirmService,
    private readonly interlocutorService: InterlocutorService,
    private readonly quotationSequenceService: QuotationSequenceService,
    private readonly quotationMetaDataService: QuotationMetaDataService,
    private readonly taxService: TaxService,

    //abstract services
    private readonly calculationsService: InvoicingCalculationsService,
    private readonly pdfService: PdfService,
  ) {}

  async downloadPdf(id: number, template: string): Promise<StreamableFile> {
    const quotation = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: new String().concat(
        'firm,',
        'cabinet,',
        'currency,',
        'bankAccount,',
        'interlocutor,',
        'cabinet.address,',
        'quotationMetaData,',
        'firm.deliveryAddress,',
        'firm.invoicingAddress,',
        'articleQuotationEntries,',
        'articleQuotationEntries.article,',
        'articleQuotationEntries.articleQuotationEntryTaxes,',
        'articleQuotationEntries.articleQuotationEntryTaxes.tax',
      ),
    });
    const digitsAferComma = quotation.currency.digitAfterComma;
    if (quotation) {
      const data = {
        meta: {
          ...quotation.quotationMetaData,
          type: 'DEVIS',
        },
        quotation: {
          ...quotation,
          date: format(quotation.date, 'dd/MM/yyyy'),
          dueDate: format(quotation.dueDate, 'dd/MM/yyyy'),
          taxSummary: quotation.quotationMetaData.taxSummary,
          subTotal: quotation.subTotal.toFixed(digitsAferComma),
          total: quotation.total.toFixed(digitsAferComma),
        },
      };

      const pdfBuffer = await this.pdfService.generatePdf(data, template);
      return new StreamableFile(pdfBuffer);
    } else {
      throw new QuotationNotFoundException();
    }
  }

  async findOneById(id: number): Promise<QuotationEntity> {
    const quotation = await this.quotationRepository.findOneById(id);
    if (!quotation) {
      throw new QuotationNotFoundException();
    }
    return quotation;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<QuotationEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const quotation = await this.quotationRepository.findOne(
      queryOptions as FindOneOptions<QuotationEntity>,
    );
    if (!quotation) return null;
    return quotation;
  }

  async findAll(query: IQueryObject = {}): Promise<QuotationEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.quotationRepository.findAll(
      queryOptions as FindManyOptions<QuotationEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseQuotationDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.quotationRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.quotationRepository.findAll(
      queryOptions as FindManyOptions<QuotationEntity>,
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
  async save(createQuotationDto: CreateQuotationDto): Promise<QuotationEntity> {
    // Parallelize fetching firm, bank account, and currency, as they are independent
    const [firm, bankAccount, currency] = await Promise.all([
      this.firmService.findOneByCondition({
        filter: `id||$eq||${createQuotationDto.firmId}`,
      }),
      createQuotationDto.bankAccountId
        ? this.bankAccountService.findOneById(createQuotationDto.bankAccountId)
        : Promise.resolve(null),
      createQuotationDto.currencyId
        ? this.currencyService.findOneById(createQuotationDto.currencyId)
        : Promise.resolve(null),
    ]);

    if (!firm) {
      throw new Error('Firm not found'); // Handle firm not existing
    }

    // Check interlocutor existence
    await this.interlocutorService.findOneById(
      createQuotationDto.interlocutorId,
    );

    // Save article entries if provided
    const articleEntries =
      createQuotationDto.articleQuotationEntries &&
      (await this.articleQuotationEntryService.saveMany(
        createQuotationDto.articleQuotationEntries,
      ));

    if (!articleEntries) {
      throw new Error('Article entries are missing');
    }

    // Calculate financial information
    const { subTotal, total } =
      this.calculationsService.calculateLineItemsTotal(
        articleEntries.map((entry) => entry.total),
        articleEntries.map((entry) => entry.subTotal),
      );

    // Apply general discount
    const totalAfterGeneralDiscount =
      this.calculationsService.calculateTotalDiscount(
        total,
        createQuotationDto.discount,
        createQuotationDto.discount_type,
      );

    // Format articleEntries as lineItems for tax calculations
    const lineItems =
      await this.articleQuotationEntryService.findManyAsLineItem(
        articleEntries.map((entry) => entry.id),
      );

    // Calculate tax summary and fetch tax details in parallel
    const taxSummary = await Promise.all(
      this.calculationsService
        .calculateTaxSummary(lineItems)
        .map(async (item) => {
          const tax = await this.taxService.findOneById(item.taxId);

          return {
            ...item,
            label: tax.label,
            // If the tax is a rate (percentage), multiply by 100 for percentage display,
            // otherwise use the fixed amount directly.
            value: tax.isRate ? tax.value * 100 : tax.value,
            isRate: tax.isRate, // You can also return this flag for further use.
          };
        }),
    );

    // Fetch the latest sequential number for quotation
    const sequential = await this.quotationSequenceService.getSequential();

    // Save quotation metadata
    const quotationMetaData = await this.quotationMetaDataService.save({
      ...createQuotationDto.quotationMetaData,
      taxSummary,
    });

    // Save the quotation entity
    const quotation = await this.quotationRepository.save({
      ...createQuotationDto,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      sequential,
      articleQuotationEntries: articleEntries,
      quotationMetaData,
      subTotal,
      total: totalAfterGeneralDiscount,
    });

    // Handle file uploads if they exist
    if (createQuotationDto.uploads) {
      await Promise.all(
        createQuotationDto.uploads.map((u) =>
          this.quotationUploadService.save(quotation.id, u.uploadId),
        ),
      );
    }

    return quotation;
  }

  async saveMany(
    createQuotationDtos: CreateQuotationDto[],
  ): Promise<QuotationEntity[]> {
    const quotations = [];
    for (const createQuotationDto of createQuotationDtos) {
      const quotation = await this.save(createQuotationDto);
      quotations.push(quotation);
    }
    return quotations;
  }

  async updateQuotationUploads(
    id: number,
    updateQuotationDto: UpdateQuotationDto,
    existingUploads: ResponseQuotationUploadDto[],
  ) {
    const newUploads = [];
    const keptUploads = [];
    const eliminatedUploads = [];

    if (updateQuotationDto.uploads) {
      for (const upload of existingUploads) {
        const exists = updateQuotationDto.uploads.some(
          (u) => u.id === upload.id,
        );
        if (!exists)
          eliminatedUploads.push(
            await this.quotationUploadService.softDelete(upload.id),
          );
        else keptUploads.push(upload);
      }
      for (const upload of updateQuotationDto.uploads) {
        if (!upload.id)
          newUploads.push(
            await this.quotationUploadService.save(id, upload.uploadId),
          );
      }
    }
    return {
      keptUploads,
      newUploads,
      eliminatedUploads,
    };
  }

  @Transactional()
  async update(
    id: number,
    updateQuotationDto: UpdateQuotationDto,
  ): Promise<QuotationEntity> {
    // Retrieve the existing quotation with necessary relations
    const { uploads: existingUploads, ...existingQuotation } =
      await this.findOneByCondition({
        filter: `id||$eq||${id}`,
        join: 'articleQuotationEntries,quotationMetaData,uploads',
      });

    // Fetch and validate related entities in parallel to optimize performance
    const [firm, bankAccount, currency, interlocutor] = await Promise.all([
      this.firmService.findOneByCondition({
        filter: `id||$eq||${updateQuotationDto.firmId}`,
      }),
      updateQuotationDto.bankAccountId
        ? this.bankAccountService.findOneById(updateQuotationDto.bankAccountId)
        : null,
      updateQuotationDto.currencyId
        ? this.currencyService.findOneById(updateQuotationDto.currencyId)
        : null,
      updateQuotationDto.interlocutorId
        ? this.interlocutorService.findOneById(
            updateQuotationDto.interlocutorId,
          )
        : null,
    ]);

    // Soft delete old article entries to prepare for new ones
    const existingArticles =
      await this.articleQuotationEntryService.softDeleteMany(
        existingQuotation.articleQuotationEntries.map((entry) => entry.id),
      );

    // Save new article entries
    const articleEntries: ArticleQuotationEntryEntity[] =
      updateQuotationDto.articleQuotationEntries
        ? await this.articleQuotationEntryService.saveMany(
            updateQuotationDto.articleQuotationEntries,
          )
        : existingArticles;

    // Calculate the subtotal and total for the new entries
    const { subTotal, total } =
      this.calculationsService.calculateLineItemsTotal(
        articleEntries.map((entry) => entry.total),
        articleEntries.map((entry) => entry.subTotal),
      );

    // Apply general discount
    const totalAfterGeneralDiscount =
      this.calculationsService.calculateTotalDiscount(
        total,
        updateQuotationDto.discount,
        updateQuotationDto.discount_type,
      );

    // Convert article entries to line items for further calculations
    const lineItems =
      await this.articleQuotationEntryService.findManyAsLineItem(
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

    // Save or update the quotation metadata with the updated tax summary
    const quotationMetaData = await this.quotationMetaDataService.save({
      ...existingQuotation.quotationMetaData,
      ...updateQuotationDto.quotationMetaData,
      taxSummary,
    });

    // Handle uploads - manage existing, new, and eliminated uploads
    const { keptUploads, newUploads, eliminatedUploads } =
      await this.updateQuotationUploads(
        existingQuotation.id,
        updateQuotationDto,
        existingUploads,
      );

    // Save and return the updated quotation with all updated details
    return this.quotationRepository.save({
      ...updateQuotationDto,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      interlocutorId: interlocutor ? interlocutor.id : null,
      articleQuotationEntries: articleEntries,
      quotationMetaData,
      subTotal,
      total: totalAfterGeneralDiscount,
      uploads: [...keptUploads, ...newUploads, ...eliminatedUploads],
    });
  }

  async duplicate(
    duplicateQuotationDto: DuplicateQuotationDto,
  ): Promise<ResponseQuotationDto> {
    const existingQuotation = await this.findOneByCondition({
      filter: `id||$eq||${duplicateQuotationDto.id}`,
      join: new String().concat(
        'quotationMetaData,',
        'articleQuotationEntries,',
        'articleQuotationEntries.articleQuotationEntryTaxes,',
        'uploads',
      ),
    });
    const quotationMetaData = await this.quotationMetaDataService.duplicate(
      existingQuotation.quotationMetaData.id,
    );
    const sequential = await this.quotationSequenceService.getSequential();
    const quotation = await this.quotationRepository.save({
      ...existingQuotation,
      sequential,
      quotationMetaData,
      articleQuotationEntries: [],
      uploads: [],
      id: undefined,
      status: QUOTATION_STATUS.Draft,
    });
    const articleQuotationEntries =
      await this.articleQuotationEntryService.duplicateMany(
        existingQuotation.articleQuotationEntries.map((entry) => entry.id),
        quotation.id,
      );

    const uploads = duplicateQuotationDto.includeFiles
      ? await this.quotationUploadService.duplicateMany(
          existingQuotation.uploads.map((upload) => upload.id),
          quotation.id,
        )
      : [];

    return this.quotationRepository.save({
      ...quotation,
      articleQuotationEntries,
      uploads,
    });
  }

  async updateStatus(
    id: number,
    status: QUOTATION_STATUS,
  ): Promise<QuotationEntity> {
    const quotation = await this.quotationRepository.findOneById(id);
    return this.quotationRepository.save({
      id: quotation.id,
      status,
    });
  }

  async updateMany(
    updateQuotationDtos: UpdateQuotationDto[],
  ): Promise<QuotationEntity[]> {
    return this.quotationRepository.updateMany(updateQuotationDtos);
  }

  async updateQuotationSequence(
    updatedSequenceDto: UpdateQuotationSequenceDto,
  ): Promise<QuotationSequence> {
    return (await this.quotationSequenceService.set(updatedSequenceDto)).value;
  }

  @Transactional()
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredQuotations() {
    const currentDate = new Date();
    const expiredQuotations: QuotationEntity[] =
      await this.quotationRepository.findAll({
        where: {
          status: QUOTATION_STATUS.Sent,
        },
      });
    const quotationsToExpire = expiredQuotations.filter((quotation) =>
      isAfter(currentDate, new Date(quotation.dueDate)),
    );

    if (quotationsToExpire.length) {
      for (const quotation of quotationsToExpire) {
        quotation.status = QUOTATION_STATUS.Expired;
        await this.quotationRepository.save(quotation);
      }
    }
  }

  async softDelete(id: number): Promise<QuotationEntity> {
    await this.findOneById(id);
    return this.quotationRepository.softDelete(id);
  }

  async deleteAll() {
    return this.quotationRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.quotationRepository.getTotalCount();
  }
}
