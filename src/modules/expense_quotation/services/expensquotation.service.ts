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
import { StorageService } from 'src/common/storage/services/storage.service';
import { ExpensQuotationUploadEntity } from '../repositories/entities/expensquotation-file.entity';


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
    private readonly storageService: StorageService,
    

    //abstract services
    private readonly calculationsService: InvoicingCalculationsService,
    private readonly pdfService: PdfService,
  ) {}


  

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
  
      // Récupérer les entités associées
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
  
      // Valider les articles
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
  
      // Sauvegarder les articles
      const articleEntries = await this.expensearticleQuotationEntryService.saveMany(createQuotationDto.articleQuotationEntries);
      console.log('Saved article entries:', articleEntries);
  
      if (!articleEntries?.length) {
        throw new Error('Article entries could not be saved');
      }
  
      // Calculer les totaux
      const { subTotal, total } = this.calculationsService.calculateLineItemsTotal(
        articleEntries.map(entry => entry.total),
        articleEntries.map(entry => entry.subTotal),
      );
  
      const totalAfterGeneralDiscount = this.calculationsService.calculateTotalDiscount(
        total,
        createQuotationDto.discount,
        createQuotationDto.discount_type,
      );
  
      // Récupérer les line items
      const lineItems = await this.expensearticleQuotationEntryService.findManyAsLineItem(
        articleEntries.map(entry => entry.id),
      );
  
      // Calculer le résumé des taxes
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
  
      // Gérer le numéro séquentiel
      const sequentialNumbr = createQuotationDto.sequentialNumbr || null;
      console.log('Sequential Number (Backend):', sequentialNumbr);
  
      // Vérifier le format du numéro séquentiel
      if (!/^QUO-\d+$/.test(sequentialNumbr)) {
        throw new Error('Invalid quotation number format. Expected format: QUO-XXXX');
      }
  
      // Récupérer le fichier PDF
      let uploadPdfField = null;
      if (createQuotationDto.pdfFileId) {
        uploadPdfField = await this.storageService.findOneById(createQuotationDto.pdfFileId);
        if (!uploadPdfField) {
          throw new NotFoundException('Uploaded PDF file not found');
        }
      }
  
      // Sauvegarder les métadonnées
      const expensequotationMetaData = await this.expensequotationMetaDataService.save({
        ...createQuotationDto.expensequotationMetaData,
        taxSummary,
      });
  
      console.log('Quotation metadata saved:', expensequotationMetaData);
  
      // Sauvegarder la quotation
      const quotation = await this.expensequotationRepository.save({
        ...createQuotationDto,
        sequential: sequentialNumbr,
        bankAccountId: bankAccount?.id ?? null,
        currencyId: currency?.id ?? firm.currencyId,
        expensearticleQuotationEntries: articleEntries,
        expensequotationMetaData,
        subTotal,
        total: totalAfterGeneralDiscount,
        uploadPdfField: uploadPdfField ? uploadPdfField : null,
        pdfFileId: uploadPdfField ? uploadPdfField.id : null,
      });
  
      console.log('Final saved quotation:', quotation);
  
      // Gérer les uploads
      if (createQuotationDto.uploads?.length) {
        await Promise.all(
          createQuotationDto.uploads.map(upload =>
            this.expensequotationUploadService.save(
              quotation.id, // expensequotationId
              upload.uploadId, // uploadId
            ),
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
    join: 'expensearticleQuotationEntries,expensequotationMetaData,uploads,uploadPdfField',
  });

  if (!existingQuotation) {
    throw new Error("Quotation not found");
  }

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

  // Sauvegarder les nouvelles entrées d'article
  const articleEntries = updateQuotationDto.articleQuotationEntries
    ? await this.expensearticleQuotationEntryService.saveMany(
        updateQuotationDto.articleQuotationEntries,
      )
    : existingArticles;

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

  // Vérifier le format du numéro séquentiel
  if (sequentialNumbr && !/^QUO-\d+$/.test(sequentialNumbr)) {
    throw new Error('Invalid quotation number format. Expected format: QUO-XXXX');
  }

  // ✅ Gestion du fichier PDF
  let pdfFileId = existingQuotation.pdfFileId; // Conserver l'ID du fichier PDF existant par défaut

  // Si un nouveau fichier PDF est fourni, mettre à jour l'ID
  if (updateQuotationDto.pdfFileId) {
    console.log('PDF File ID reçu du frontend:', updateQuotationDto.pdfFileId); // Vérifiez l'ID du fichier PDF
    pdfFileId = updateQuotationDto.pdfFileId;
  }

  // Gérer les fichiers uploadés
  const { keptUploads, newUploads, eliminatedUploads } = await this.updateExpenseQuotationUpload(
    id,
    updateQuotationDto,
    existingQuotation.uploads || [],
  );

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
    pdfFileId, // Inclure l'ID du fichier PDF (nouveau ou existant)
  });

  return updatedQuotation;
}

async updateExpenseQuotationUpload(
  id: number,
  updateQuotationDto: UpdateExpensQuotationDto,
  existingUploads: ExpensQuotationUploadEntity[], // Utiliser le bon type pour les uploads (entités)
) {
  const newUploads: ExpensQuotationUploadEntity[] = [];
  const keptUploads: ExpensQuotationUploadEntity[] = [];
  const eliminatedUploads: ExpensQuotationUploadEntity[] = [];

  if (updateQuotationDto.uploads) {
    try {
      // Gestion des fichiers existants
      for (const upload of existingUploads) {
        const exists = updateQuotationDto.uploads.some(
          (u) => u.uploadId === upload.uploadId, // Utiliser uploadId pour la correspondance
        );
        if (!exists) {
          console.log(`Suppression du fichier avec l'uploadId ${upload.uploadId}`);
          const deletedUpload = await this.expensequotationUploadService.softDelete(upload.id); // Suppression douce
          eliminatedUploads.push(deletedUpload);
        } else {
          keptUploads.push(upload); // Conserver le fichier existant
        }
      }

      // Ajout des nouveaux fichiers
      for (const upload of updateQuotationDto.uploads) {
        if (!upload.id) { // Vérifier si c'est un nouveau fichier
          console.log(`Ajout d'un nouveau fichier avec l'uploadId ${upload.uploadId}`);
          const newUpload = await this.expensequotationUploadService.save(id, upload.uploadId); // Enregistrer le nouveau fichier
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

async duplicate(
  duplicateQuotationDto: DuplicateExpensQuotationDto,
): Promise<ResponseExpensQuotationDto> {
  try {
    // Récupérer le devis existant avec ses relations
    const existingQuotation = await this.findOneByCondition({
      filter: `id||$eq||${duplicateQuotationDto.id}`,
      join: 'expensequotationMetaData,expensearticleQuotationEntries,expensearticleQuotationEntries.articleExpensQuotationEntryTaxes,uploads,uploadPdfField',
    });

    if (!existingQuotation) {
      throw new Error("Quotation not found");
    }

    console.log("Existing Quotation:", existingQuotation);

    // Dupliquer les métadonnées du devis
    const expensequotationMetaData = await this.expensequotationMetaDataService.duplicate(
      existingQuotation.expensequotationMetaData.id,
    );

    // Exclure les champs non nécessaires pour la duplication
    const { id, sequential, sequentialNumbr, expensequotationMetaData: _, 
            expensearticleQuotationEntries: existingEntries, 
            uploads, uploadPdfField, ...quotationData } = existingQuotation;

    // Créer un nouveau devis avec les données dupliquées
    const quotation = await this.expensequotationRepository.save({
      ...quotationData,
      sequential: null,
      sequentialNumbr: null,
      expensequotationMetaData,
      expensearticleQuotationEntries: [],
      uploads: [],
      uploadPdfField: null,
      status: EXPENSQUOTATION_STATUS.Draft,
    });

    console.log("Entries to duplicate:", existingEntries.map((e) => e.id));

    // Dupliquer les articles
    const expensearticleQuotationEntries = await this.expensearticleQuotationEntryService.duplicateMany(
      existingEntries.map((entry) => entry.id),
      quotation.id,
    );

   // Dupliquer les fichiers uploadés si includeFiles est true
// Dupliquer les fichiers uploadés si includeFiles est true
// Dupliquer les fichiers uploadés si includeFiles est true
let duplicatedUploads = [];
if (duplicateQuotationDto.includeFiles && existingQuotation.uploads?.length > 0) {
  duplicatedUploads = await this.expensequotationUploadService.duplicateMany(
    existingQuotation.uploads.map((upload) => upload.id),
    quotation.id,
  );
  console.log("Duplicated Uploads:", duplicatedUploads); // Log des fichiers uploadés dupliqués
} else {
  console.log("Skipping file duplication: includeFiles is false or no files to duplicate");
}

// Dupliquer le fichier PDF si includeFiles est true et qu'un PDF existe
let duplicatedPdfFile = null;
if (duplicateQuotationDto.includeFiles && existingQuotation.uploadPdfField) {
  const existingPdfFile = await this.storageService.findOneById(existingQuotation.uploadPdfField.id);
  if (!existingPdfFile) {
    throw new Error('Existing PDF file not found');
  }
  duplicatedPdfFile = await this.storageService.duplicate(existingPdfFile.id);
  console.log("Duplicated PDF File:", duplicatedPdfFile); // Log du fichier PDF dupliqué
} else {
  console.log("Skipping PDF duplication: includeFiles is false or no PDF to duplicate");
}

    console.log("Duplicated Entries:", expensearticleQuotationEntries);
    console.log("Duplicated Uploads:", duplicatedUploads);
    console.log("Duplicated PDF File:", duplicatedPdfFile);

    // Mettre à jour le devis avec les fichiers et articles dupliqués
    const updatedQuotation = await this.expensequotationRepository.save({
      ...quotation,
      expensearticleQuotationEntries,
      uploads: duplicatedUploads,
      uploadPdfField: duplicatedPdfFile ? { id: duplicatedPdfFile.id } : null,
    });

    console.log("Updated Quotation to return:", updatedQuotation); // Log du devis mis à jour
    return updatedQuotation;
  } catch (error) {
    console.error("Error during duplication:", error);
    throw error;
  }
}

// Dans votre service backend (expensquotation.service.ts)
async deletePdfFile(quotationId: number): Promise<void> {
  const quotation = await this.expensequotationRepository.findOneById(quotationId);
  if (!quotation) {
    throw new Error("Quotation not found");
  }

  if (quotation.pdfFileId) {
    // Supprimer le fichier PDF de la base de données
    await this.storageService.delete(quotation.pdfFileId);

    // Mettre à jour le devis pour retirer l'ID du fichier PDF
    await this.expensequotationRepository.save({
      ...quotation,
      pdfFileId: null,
      uploadPdfField: null,
    });
  }
}
async updateQuotationStatusIfExpired(quotationId: number): Promise<ExpensQuotationEntity> {
    const quotation = await this.findOneById(quotationId);
    const currentDate = new Date();
    const dueDate = new Date(quotation.dueDate);
  
    if (dueDate < currentDate && quotation.status !== EXPENSQUOTATION_STATUS.Expired) {
      quotation.status = EXPENSQUOTATION_STATUS.Expired;
      return this.expensequotationRepository.save(quotation);
    }
  
    return quotation;
  }



  
  




  
  
}
  
