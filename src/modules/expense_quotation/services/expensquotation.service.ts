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




  async findOneById(id: number): Promise<ExpensQuotationEntity> {
    const expensequotation = await this.expensequotationRepository.findOneById(id);
    if (!expensequotation) {
      throw new QuotationNotFoundException();
    }
    return expensequotation;
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
    await this.interlocutorService.findOneById(createQuotationDto.interlocutorId);
  
    // Log and validate article entries
    if (createQuotationDto.articleQuotationEntries) {
      createQuotationDto.articleQuotationEntries.forEach((entry, index) => {
        console.log(`Entry at index ${index}:`, entry); // Log the entry to help with debugging
  
        // Ensure article data is properly structured and all required fields are present
        if (!entry.article || !entry.article.title || entry.quantity === undefined || entry.unit_price === undefined) {
          // Log what fields are missing from the entry for better error message clarity
          const missingFields = [];
          if (!entry.article || !entry.article.title) missingFields.push('title');
          if (entry.quantity === undefined) missingFields.push('quantity');
          if (entry.unit_price === undefined) missingFields.push('unit_price');
  
          throw new Error(`Invalid article entry at index ${index}: Missing required fields (${missingFields.join(', ')}).`);
        }
  
        // Further check that unit_price and quantity are of the correct types
        if (typeof entry.unit_price !== 'number') {
          throw new Error(`Invalid unit_price type at index ${index}: Expected number, got ${typeof entry.unit_price}`);
        }
        if (typeof entry.quantity !== 'number') {
          throw new Error(`Invalid quantity type at index ${index}: Expected number, got ${typeof entry.quantity}`);
        }
      });
    }
  
    // Save article entries if provided
    const articleEntries =
      createQuotationDto.articleQuotationEntries &&
      (await this.expensearticleQuotationEntryService.saveMany(createQuotationDto.articleQuotationEntries));
  
    if (!articleEntries || articleEntries.length === 0) {
      throw new Error('Article entries are missing or invalid');
    }
  
    // Calculate financial information
    const { subTotal, total } = this.calculationsService.calculateLineItemsTotal(
      articleEntries.map((entry) => entry.total),
      articleEntries.map((entry) => entry.subTotal),
    );
  
    // Apply general discount
    const totalAfterGeneralDiscount = this.calculationsService.calculateTotalDiscount(
      total,
      createQuotationDto.discount,
      createQuotationDto.discount_type,
    );
  
    // Format articleEntries as lineItems for tax calculations
    const lineItems = await this.expensearticleQuotationEntryService.findManyAsLineItem(
      articleEntries.map((entry) => entry.id),
    );
  
    // Calculate tax summary and fetch tax details in parallel
    const taxSummary = await Promise.all(
      this.calculationsService.calculateTaxSummary(lineItems).map(async (item) => {
        const tax = await this.taxService.findOneById(item.taxId);
  
        return {
          ...item,
          label: tax.label,
          value: tax.isRate ? tax.value * 100 : tax.value,
          isRate: tax.isRate,
        };
      }),
    );
  
    // Fetch the latest sequential number for quotation
    const sequential = await this.expensequotationSequenceService.getSequential();
  
    // Save quotation metadata
    const expensequotationMetaData = await this.expensequotationMetaDataService.save({
      ...createQuotationDto.expensequotationMetaData,
      taxSummary,
    });
  
    // Save the quotation entity
    const quotation = await this.expensequotationRepository.save({
      ...createQuotationDto,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      sequential,
      expensearticleQuotationEntries: articleEntries,
      expensequotationMetaData,
      subTotal,
      total: totalAfterGeneralDiscount,
    });
  
    // Handle file uploads if they exist
    if (createQuotationDto.uploads) {
      await Promise.all(
        createQuotationDto.uploads.map((u) =>
          this.expensequotationUploadService.save(quotation.id, u.uploadId),
        ),
      );
    }
  
    return quotation;
  }
  
}  