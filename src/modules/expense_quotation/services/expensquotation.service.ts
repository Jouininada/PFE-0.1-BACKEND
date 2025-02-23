/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { ExpensQuotationEntity } from '../repositories/entities/expensquotation.entity';
import { QuotationNotFoundException } from '../errors/quotation.notfound.error';
import { ResponseExpensQuotationDto } from '../dtos/expensquotation.response.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { CreateExpensQuotationDto } from '../dtos/expensquotation.create.dto';
import { UpdateExpensQuotationDto } from '../dtos/expensquotation.update.dto';
import { CurrencyService } from 'src/modules/currency/services/currency.service';
import { FirmService } from 'src/modules/firm/services/firm.service';
import { InterlocutorService } from 'src/modules/interlocutor/services/interlocutor.service';
import { InvoicingCalculationsService } from 'src/common/calculations/services/invoicing.calculations.service';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { ArticleExpensQuotationEntryService } from './article-expensquotation-entry.service';
import { ArticleExpensQuotationEntryEntity } from '../repositories/entities/article-expensquotation-entry.entity';
import { PdfService } from 'src/common/pdf/services/pdf.service';
import { format, isAfter } from 'date-fns';
import { ExpensQuotationSequenceService } from './expensquotation-sequence.service';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { ExpensQuotationMetaDataService } from './expensquotation-meta-data.service';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { BankAccountService } from 'src/modules/bank-account/services/bank-account.service';
import { ExpensQuotationUploadService } from './expensquotation-upload.service';
import { ExpensequotationRepository } from '../repositories/repository/expensquotation.repository';
import { EXPENSQUOTATION_STATUS } from '../enums/expensquotation-status.enum';
import { Transactional } from '@nestjs-cls/transactional';
import { DuplicateExpensQuotationDto } from '../dtos/expensquotation.duplicate.dto';
import { ExpensQuotationMetaDataEntity } from '../repositories/entities/expensquotation-meta-data.entity';
import { QUOTATION_STATUS } from 'src/modules/quotation/enums/quotation-status.enum';
import { StorageBadRequestException } from 'src/common/storage/errors/storage.bad-request.error';


@Injectable()
export class ExpensQuotationService {
  constructor(
    //repositories
    private readonly expensequotationRepository: ExpensequotationRepository,
    //entity services
    private readonly expensearticleQuotationEntryService: ArticleExpensQuotationEntryService,
    private readonly expensequotationUploadService: ExpensQuotationUploadService,
    private readonly bankAccountService: BankAccountService,
    private readonly currencyService: CurrencyService,
    private readonly firmService: FirmService,
    private readonly interlocutorService: InterlocutorService,
    private readonly expensequotationSequenceService: ExpensQuotationSequenceService,
    private readonly expensequotationMetaDataService: ExpensQuotationMetaDataService,
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
        'expensequotationMetaData,',
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
          ...quotation.expensequotationMetaData,
          type: 'DEVIS',
        },
        quotation: {
          ...quotation,
          date: format(quotation.date, 'dd/MM/yyyy'),
          dueDate: format(quotation.dueDate, 'dd/MM/yyyy'),
          taxSummary: quotation.expensequotationMetaData.taxSummary,
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

  

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ExpensQuotationEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const expensequotation = await this.expensequotationRepository.findOne(
      queryOptions as FindOneOptions<ExpensQuotationEntity>,
    );
    if (!expensequotation) return null;
    return expensequotation;
  }

  async findAll(query: IQueryObject = {}): Promise<ExpensQuotationEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.expensequotationRepository.findAll(
      queryOptions as FindManyOptions<ExpensQuotationEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseExpensQuotationDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.expensequotationRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.expensequotationRepository.findAll(
      queryOptions as FindManyOptions<ExpensQuotationEntity>,
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
async save(createQuotationDto: CreateExpensQuotationDto): Promise<ExpensQuotationEntity> {
  try {
    // Récupération des données en parallèle
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
      throw new Error('Firm not found');
    }
    console.log('Firm found:', firm);

    // Vérification de l'interlocuteur
    await this.interlocutorService.findOneById(createQuotationDto.interlocutorId);

    // Validation des articles
    if (createQuotationDto.articleQuotationEntries?.length) {
      for (const [index, entry] of createQuotationDto.articleQuotationEntries.entries()) {
        console.log(`Entry at index ${index}:`, entry);

        if (!entry.article?.title || entry.quantity === undefined || entry.unit_price === undefined) {
          const missingFields = [];
          if (!entry.article?.title) missingFields.push('title');
          if (entry.quantity === undefined) missingFields.push('quantity');
          if (entry.unit_price === undefined) missingFields.push('unit_price');

          throw new Error(`Invalid article entry at index ${index}: Missing required fields (${missingFields.join(', ')}).`);
        }

        if (typeof entry.unit_price !== 'number' || typeof entry.quantity !== 'number') {
          throw new Error(`Invalid type for unit_price or quantity at index ${index}`);
        }
      }
    } else {
      throw new Error('No article entries provided');
    }

    // Sauvegarde des articles
    const articleEntries = await this.expensearticleQuotationEntryService.saveMany(createQuotationDto.articleQuotationEntries);
    if (!articleEntries?.length) {
      throw new Error('Article entries could not be saved');
    }

    // Calcul des totaux
    const { subTotal, total } = this.calculationsService.calculateLineItemsTotal(
      articleEntries.map(entry => entry.total),
      articleEntries.map(entry => entry.subTotal),
    );

    const totalAfterGeneralDiscount = this.calculationsService.calculateTotalDiscount(
      total,
      createQuotationDto.discount,
      createQuotationDto.discount_type,
    );

    // Récupération des lignes pour le calcul des taxes
    const lineItems = await this.expensearticleQuotationEntryService.findManyAsLineItem(
      articleEntries.map(entry => entry.id),
    );

    // Calcul des taxes
    const taxSummary = await Promise.all(
      this.calculationsService.calculateTaxSummary(lineItems).map(async item => {
        const tax = await this.taxService.findOneById(item.taxId);
        return {
          ...item,
          label: tax.label,
          value: tax.isRate ? tax.value * 100 : tax.value,
          isRate: tax.isRate,
        };
      }),
    );

    // Récupération du séquentiel
    const sequential = await this.expensequotationSequenceService.getSequential();

    // Sauvegarde des métadonnées
    const expensequotationMetaData = await this.expensequotationMetaDataService.save({
      ...createQuotationDto.expensequotationMetaData,
      taxSummary,
    });

    // Sauvegarde du devis
    const quotation = await this.expensequotationRepository.save({
      ...createQuotationDto,
      bankAccountId: bankAccount?.id ?? null,
      currencyId: currency?.id ?? firm.currencyId,
      sequential,
      expensearticleQuotationEntries: articleEntries,
      expensequotationMetaData,
      subTotal,
      total: totalAfterGeneralDiscount,
    });

    // Gestion des fichiers joints
    if (createQuotationDto.uploads?.length) {
      await Promise.all(
        createQuotationDto.uploads.map(upload =>
          this.expensequotationUploadService.save(quotation.id, upload.uploadId),
        ),
      );
    }

    return quotation;
  } catch (error) {
    console.error('Error saving quotation:', error);
    throw new Error(`Failed to save quotation: ${error.message}`);
  }
}

  
  async findOneById(id: number): Promise<ExpensQuotationEntity> {
    const expensequotation = await this.expensequotationRepository.findOne({
      where: { id },
      withDeleted: true, // Permet de retrouver les éléments soft-deleted
    });
  
    if (!expensequotation) {
      throw new QuotationNotFoundException();
    }
    
    return expensequotation;
  }

  async saveMany(
    createQuotationDtos: CreateExpensQuotationDto[],
  ): Promise<ExpensQuotationEntity[]> {
    const quotations = [];
    for (const createQuotationDto of createQuotationDtos) {
      const quotation = await this.save(createQuotationDto);
      quotations.push(quotation);
    }
    return quotations;
  }


  async softDelete(id: number): Promise<ExpensQuotationEntity> {
    await this.findOneById(id);
    return this.expensequotationRepository.softDelete(id);
  }

  async deleteAll() {
    return this.expensequotationRepository.deleteAll();
  }

  async updateQuotationUploads(
    id: number,
    updateQuotationDto: UpdateExpensQuotationDto,
    existingUploads: UpdateExpensQuotationDto[],
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
            await this.expensequotationUploadService.softDelete(upload.id),
          );
        else keptUploads.push(upload);
      }
      for (const upload of updateQuotationDto.uploads) {
        if (!upload.id)
          newUploads.push(
            await this.expensequotationUploadService.save(id, upload.uploadId),
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
    updateQuotationDto: UpdateExpensQuotationDto,
  ): Promise<ExpensQuotationEntity> {
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
      await this.expensearticleQuotationEntryService.softDeleteMany(
        existingQuotation.expensearticleQuotationEntries.map((entry) => entry.id),
      );

    // Save new article entries
    const articleEntries: ArticleExpensQuotationEntryEntity[] =
      updateQuotationDto.articleQuotationEntries
        ? await this.expensearticleQuotationEntryService.saveMany(
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
      await this.expensearticleQuotationEntryService.findManyAsLineItem(
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
    const expensequotationMetaData = await this.expensequotationMetaDataService.save({
      ...existingQuotation.expensequotationMetaData,
      ...updateQuotationDto.expensequotationMetaData,
      taxSummary,
    });

    // Handle uploads - manage existing, new, and eliminated uploads
   /* const { keptUploads, newUploads, eliminatedUploads } =
      await this.updateQuotationUploads(
        existingQuotation.id,
        updateQuotationDto,
        existingUploads,
      );*/

    // Save and return the updated quotation with all updated details
    return this.expensequotationRepository.save({
      ...updateQuotationDto,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      interlocutorId: interlocutor ? interlocutor.id : null,
      expensearticleQuotationEntries: articleEntries,
      expensequotationMetaData,
      subTotal,
      total: totalAfterGeneralDiscount,
     // uploads: [...keptUploads, ...newUploads, ...eliminatedUploads],
    });
  }



  
  
}
  
