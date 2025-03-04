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
        'expensearticleQuotationEntries,',
        'expensearticleQuotationEntries.article,',
        'expensearticleQuotationEntries.articleExpensQuotationEntryTaxes,',
        'expensearticleQuotationEntries.articleExpensQuotationEntryTaxes.tax',
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
    console.log('Received DTO:', createQuotationDto);

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

    await this.interlocutorService.findOneById(createQuotationDto.interlocutorId);

    console.log('Articles received:', createQuotationDto.articleQuotationEntries);

    if (!createQuotationDto.articleQuotationEntries?.length) {
      throw new Error('No article entries provided');
    }

    for (const [index, entry] of createQuotationDto.articleQuotationEntries.entries()) {
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

    const articleEntries = await this.expensearticleQuotationEntryService.saveMany(createQuotationDto.articleQuotationEntries);
    console.log('Saved article entries:', articleEntries);

    if (!articleEntries?.length) {
      throw new Error('Article entries could not be saved');
    }

    const { subTotal, total } = this.calculationsService.calculateLineItemsTotal(
      articleEntries.map(entry => entry.total),
      articleEntries.map(entry => entry.subTotal),
    );

    const totalAfterGeneralDiscount = this.calculationsService.calculateTotalDiscount(
      total,
      createQuotationDto.discount,
      createQuotationDto.discount_type,
    );

    const lineItems = await this.expensearticleQuotationEntryService.findManyAsLineItem(
      articleEntries.map(entry => entry.id),
    );

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

    const sequentialNumbr = createQuotationDto.sequentialNumbr || null;
    console.log('Sequential Number (Backend):', sequentialNumbr);

    const expensequotationMetaData = await this.expensequotationMetaDataService.save({
      ...createQuotationDto.expensequotationMetaData,
      taxSummary,
    });

    console.log('Quotation metadata saved:', expensequotationMetaData);

    const quotation = await this.expensequotationRepository.save({
      ...createQuotationDto,
      sequential: sequentialNumbr,
      bankAccountId: bankAccount?.id ?? null,
      currencyId: currency?.id ?? firm.currencyId,
      expensearticleQuotationEntries: articleEntries,
      expensequotationMetaData,
      subTotal,
      total: totalAfterGeneralDiscount,
    });

    console.log('Final saved quotation:', quotation);

    if (createQuotationDto.uploads?.length) {
      await Promise.all(
        createQuotationDto.uploads.map(upload =>
          this.expensequotationUploadService.save(quotation.id, upload.uploadId,upload.pdfFileId),
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
            await this.expensequotationUploadService.save(id, upload.uploadId,upload.pdfFileId),
          );
      }
    }
    return {
      keptUploads,
      newUploads,
      eliminatedUploads,
    };
  }

  async updateStatus(
    id: number,
    status: EXPENSQUOTATION_STATUS,
  ): Promise<ExpensQuotationEntity> {
    const quotation = await this.expensequotationRepository.findOneById(id);
    return this.expensequotationRepository.save({
      id: quotation.id,
      status,
    });
  }


  @Transactional()
  async update(
    id: number,
    updateQuotationDto: UpdateExpensQuotationDto,
  ): Promise<ExpensQuotationEntity> {
    // Récupérer l'ancienne quotation avec ses relations
    const existingQuotation = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'expensearticleQuotationEntries,expensequotationMetaData,uploads',
    });

    if (!existingQuotation) {
      throw new Error("Quotation not found");
    }

    console.log("Ancienne quotation récupérée:", existingQuotation);
    console.log(
      "Articles associés à l'ancienne quotation:",
      existingQuotation.expensearticleQuotationEntries,
    );

    // Récupérer et valider les entités associées en parallèle
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
        ? this.interlocutorService.findOneById(updateQuotationDto.interlocutorId)
        : null,
    ]);

    // Supprimer logiquement les anciennes entrées d'article
    const existingArticles =
      await this.expensearticleQuotationEntryService.softDeleteMany(
        existingQuotation.expensearticleQuotationEntries.map((entry) => entry.id),
      );

    console.log("Anciens articles après suppression:", existingArticles);

    // Sauvegarder les nouvelles entrées d'article
    const articleEntries = updateQuotationDto.articleQuotationEntries
      ? await this.expensearticleQuotationEntryService.saveMany(
          updateQuotationDto.articleQuotationEntries,
        )
      : existingArticles;
      console.log("Update DTO:", updateQuotationDto);
    console.log("Nouvelles entrées d'article reçues:", updateQuotationDto.articleQuotationEntries);
    console.log("Nouveaux articles sauvegardés:", articleEntries);

    // Calculer le sous-total et le total des nouvelles entrées
    const { subTotal, total } =
      this.calculationsService.calculateLineItemsTotal(
        articleEntries.map((entry) => entry.total),
        articleEntries.map((entry) => entry.subTotal),
      );

    // Appliquer la remise générale
    const totalAfterGeneralDiscount =
      this.calculationsService.calculateTotalDiscount(
        total,
        updateQuotationDto.discount,
        updateQuotationDto.discount_type,
      );

    // Convertir les entrées d'article en éléments de ligne
    const lineItems =
      await this.expensearticleQuotationEntryService.findManyAsLineItem(
        articleEntries.map((entry) => entry.id),
      );

    // Calculer le résumé des taxes
    const taxSummary = await Promise.all(
      this.calculationsService
        .calculateTaxSummary(lineItems)
        .map(async (item) => {
          const tax = await this.taxService.findOneById(item.taxId);
          return {
            ...item,
            label: tax.label,
            rate: tax.isRate ? tax.value * 100 : tax.value,
            isRate: tax.isRate,
          };
        }),
    );

    // Sauvegarder ou mettre à jour les métadonnées de la quotation
    const expensequotationMetaData = await this.expensequotationMetaDataService.save({
      ...existingQuotation.expensequotationMetaData,
      ...updateQuotationDto.expensequotationMetaData,
      taxSummary,
    });

    // Récupérer ou conserver le numéro séquentiel
    const sequentialNumbr = updateQuotationDto.sequentialNumbr || existingQuotation.sequential;

    // Sauvegarder et retourner la quotation mise à jour
    const updatedQuotation = await this.expensequotationRepository.save({
      ...existingQuotation, // Garder les données existantes
      ...updateQuotationDto, // Mettre à jour avec les nouvelles données
      sequential: sequentialNumbr,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      interlocutorId: interlocutor ? interlocutor.id : null,
      expensearticleQuotationEntries: articleEntries,
      expensequotationMetaData,
      subTotal,
      total: totalAfterGeneralDiscount,
    });

    console.log("Quotation mise à jour avec les articles:", updatedQuotation);
    console.log("Articles dans la quotation mise à jour:", updatedQuotation.expensearticleQuotationEntries);

    return updatedQuotation;
  }

  async duplicate(
  duplicateQuotationDto: DuplicateExpensQuotationDto,
): Promise<ResponseExpensQuotationDto> {
  const existingQuotation = await this.findOneByCondition({
    filter: `id||$eq||${duplicateQuotationDto.id}`,
    join: 'expensequotationMetaData,expensearticleQuotationEntries,expensearticleQuotationEntries.articleExpensQuotationEntryTaxes,uploads',
  });
  console.log("Existing Quotation:", existingQuotation);

  const expensequotationMetaData = await this.expensequotationMetaDataService.duplicate(
    existingQuotation.expensequotationMetaData.id,
  );

  // Renommage pour éviter les conflits de nom
  const { id, sequential, sequentialNumbr, expensequotationMetaData: _, 
          expensearticleQuotationEntries: existingEntries, 
          uploads, ...quotationData } = existingQuotation;

  const quotation = await this.expensequotationRepository.save({
    ...quotationData,
    sequential: null,
    sequentialNumbr: null,
    expensequotationMetaData,
    expensearticleQuotationEntries: [],
    uploads: [],
    status: EXPENSQUOTATION_STATUS.Draft,
  });

  // Duplication des articles et des fichiers en parallèle

console.log("Entries to duplicate:", existingEntries.map((e) => e.id));

const [expensearticleQuotationEntries, duplicatedUploads] = await Promise.all([
  this.expensearticleQuotationEntryService.duplicateMany(
    existingEntries.map((entry) => entry.id),
    quotation.id,
  ),
  duplicateQuotationDto.includeFiles
    ? this.expensequotationUploadService.duplicateMany(
        uploads.map((upload) => upload.id),
        quotation.id,
      )
    : Promise.resolve([]),
]);

console.log("Duplicated Entries:", expensearticleQuotationEntries);
console.log("Duplicated Uploads:", duplicatedUploads);


  return this.expensequotationRepository.save({
    ...quotation,
    expensearticleQuotationEntries,
    uploads: duplicatedUploads,
  });
}

  
  




  
  
}
  
