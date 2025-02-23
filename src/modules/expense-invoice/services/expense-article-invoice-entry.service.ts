import { Injectable } from '@nestjs/common';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { ArticleService } from 'src/modules/article/services/article.service';
import { ResponseArticleDto } from 'src/modules/article/dtos/article.response.dto';
import { InvoicingCalculationsService } from 'src/common/calculations/services/invoicing.calculations.service';
import { LineItem } from 'src/common/calculations/interfaces/line-item.interface';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindOneOptions } from 'typeorm';
import { ExpenseArticleInvoiceEntryRepository } from '../repositories/repository/expense-invoice-article-entry.repository';
import { ExpenseArticleInvoiceEntryTaxService } from './expense-article-invoice-entry-tax.service';
import { ExpenseResponseArticleInvoiceEntryDto } from '../dtos/expense-article-invoice-entry.response.dto';
import { ExpenseArticleInvoiceEntryEntity } from '../repositories/entities/expense-article-invoice-entry.entity';
import { ExpenseCreateArticleInvoiceEntryDto } from '../dtos/expense-article-invoice-entry.create.dto';
import { ExpenseUpdateArticleInvoiceEntryDto } from '../dtos/expense-article-invoice-entry.update.dto';
import { ExpenseArticleInvoiceEntryNotFoundException } from '../errors/expense-article-invoice-entry.notfound.error';

@Injectable()
export class ExpenseArticleInvoiceEntryService {
  constructor(
    private readonly articleInvoiceEntryRepository: ExpenseArticleInvoiceEntryRepository,
    private readonly articleInvoiceEntryTaxService: ExpenseArticleInvoiceEntryTaxService,
    private readonly articleService: ArticleService,
    private readonly taxService: TaxService,
    private readonly calculationsService: InvoicingCalculationsService,
  ) {}

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ExpenseResponseArticleInvoiceEntryDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const entry = await this.articleInvoiceEntryRepository.findOne(
      queryOptions as FindOneOptions<ExpenseArticleInvoiceEntryEntity>,
    );
    if (!entry) return null;
    return entry;
  }

  async findOneById(id: number): Promise<ExpenseResponseArticleInvoiceEntryDto> {
    const entry = await this.articleInvoiceEntryRepository.findOneById(id);
    if (!entry) {
      throw new ExpenseArticleInvoiceEntryNotFoundException();
    }
    return entry;
  }

  async findOneAsLineItem(id: number): Promise<LineItem> {
    const entry = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'expenseArticleInvoiceEntryTaxes',
    });
    const taxes = entry.articleInvoiceEntryTaxes
      ? await Promise.all(
          entry.articleInvoiceEntryTaxes.map((taxEntry) =>
            this.taxService.findOneById(taxEntry.taxId),
          ),
        )
      : [];
    return {
      quantity: entry.quantity,
      unit_price: entry.unit_price,
      discount: entry.discount,
      discount_type: entry.discount_type,
      taxes: taxes,
    };
  }

  async findManyAsLineItem(ids: number[]): Promise<LineItem[]> {
    const lineItems = await Promise.all(
      ids.map((id) => this.findOneAsLineItem(id)),
    );
    return lineItems;
  }

  async save(
  createArticleInvoiceEntryDto: ExpenseCreateArticleInvoiceEntryDto,
): Promise<ExpenseArticleInvoiceEntryEntity> {
  // Récupérer les taxes associées
  const taxes = createArticleInvoiceEntryDto.taxes
    ? await Promise.all(
        createArticleInvoiceEntryDto.taxes.map((id) =>
          this.taxService.findOneById(id),
        ),
      )
    : [];

  // Vérifier si l'article existe, sinon le créer
  let article = await this.articleService.findOneByCondition({
    filter: `title||$eq||${createArticleInvoiceEntryDto.article.title}`,
  });

  if (!article) {
    article = await this.articleService.save(createArticleInvoiceEntryDto.article);
  }

  // Construire l'objet ligne d'article
  const lineItem = {
    quantity: createArticleInvoiceEntryDto.quantity,
    unit_price: createArticleInvoiceEntryDto.unit_price,
    discount: createArticleInvoiceEntryDto.discount,
    discount_type: createArticleInvoiceEntryDto.discount_type,
    taxes: taxes,
  };

  // Sauvegarder l'entrée de la facture article
  const entry = await this.articleInvoiceEntryRepository.save({
    ...createArticleInvoiceEntryDto,
    articleId: article.id,
    article: article,
    subTotal: this.calculationsService.calculateSubTotalForLineItem(lineItem),
    total: this.calculationsService.calculateTotalForLineItem(lineItem),
  });

  // Vérification si l'entrée a bien été créée
  if (!entry || !entry.id) {
    throw new Error('Failed to save ExpenseArticleInvoiceEntryEntity');
  }

  // Sauvegarder les taxes associées
  if (taxes.length > 0) {
    await this.articleInvoiceEntryTaxService.saveMany(
      taxes.map((tax) => ({
        taxId: tax.id,
        articleInvoiceEntryId: entry.id,
      })),
    );
  }

  return entry;
}


  async saveMany(
    createArticleInvoiceEntryDtos: ExpenseCreateArticleInvoiceEntryDto[],
  ): Promise<ExpenseArticleInvoiceEntryEntity[]> {
    const savedEntries = [];
    for (const dto of createArticleInvoiceEntryDtos) {
      const savedEntry = await this.save(dto);
      savedEntries.push(savedEntry);
    }
    return savedEntries;
  }

  async update(
    id: number,
    updateArticleInvoiceEntryDto: ExpenseUpdateArticleInvoiceEntryDto,
  ): Promise<ExpenseArticleInvoiceEntryEntity> {
    //fetch exisiting entry
    const existingEntry =
      await this.articleInvoiceEntryRepository.findOneById(id);
    this.articleInvoiceEntryTaxService.softDeleteMany(
      existingEntry.expenseArticleInvoiceEntryTaxes.map((taxEntry) => taxEntry.id),
    );

    //fetch and check the existance of all taxes
    const taxes = updateArticleInvoiceEntryDto.taxes
      ? await Promise.all(
          updateArticleInvoiceEntryDto.taxes.map((id) =>
            this.taxService.findOneById(id),
          ),
        )
      : [];

    //delete all existing taxes and rebuild
    for (const taxEntry of existingEntry.expenseArticleInvoiceEntryTaxes) {
      this.articleInvoiceEntryTaxService.softDelete(taxEntry.id);
    }

    //save and check of articles existance , if a given article doesn't exist by name , it will be created
    let article: ResponseArticleDto;
    try {
      article = await this.articleService.findOneByCondition({
        filter: `title||$eq||${updateArticleInvoiceEntryDto.article.title}`,
      });
    } catch (error) {
      article = await this.articleService.save(
        updateArticleInvoiceEntryDto.article,
      );
    }

    const lineItem = {
      quantity: updateArticleInvoiceEntryDto.quantity,
      unit_price: updateArticleInvoiceEntryDto.unit_price,
      discount: updateArticleInvoiceEntryDto.discount,
      discount_type: updateArticleInvoiceEntryDto.discount_type,
      taxes: taxes,
    };

    //update the entry with the new data and save it
    const entry = await this.articleInvoiceEntryRepository.save({
      ...existingEntry,
      ...updateArticleInvoiceEntryDto,
      articleId: article.id,
      article: article,
      subTotal: this.calculationsService.calculateSubTotalForLineItem(lineItem),
      total: this.calculationsService.calculateTotalForLineItem(lineItem),
    });
    //save the new tax entries for the article entry
    await this.articleInvoiceEntryTaxService.saveMany(
      taxes.map((tax) => {
        return {
          taxId: tax.id,
          articleInvoiceEntryId: entry.id,
        };
      }),
    );
    return entry;
  }

  async duplicate(
    id: number,
    invoiceId: number,
  ): Promise<ExpenseArticleInvoiceEntryEntity> {
    // Fetch the existing entry with its taxes
    const existingEntry = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'expenseArticleInvoiceEntryTaxes',
    });
  
    if (!existingEntry) {
      throw new Error(`Entry with id ${id} not found`);
    }
  
    // Duplicate the taxes associated with this entry
    const duplicatedTaxes = existingEntry.articleInvoiceEntryTaxes?.map((taxEntry) => ({
      taxId: taxEntry.taxId,
    })) || [];
  
    // Create the duplicated entry
    const duplicatedEntry = this.articleInvoiceEntryRepository.create({
      ...existingEntry,
      id: undefined, // Remove the existing ID
      expenseInvoiceId: invoiceId, // Assign the new invoice ID
      expenseArticleInvoiceEntryTaxes: undefined, // Remove reference to existing taxes
      createdAt: undefined,
      updatedAt: undefined,
    });
  
    // Save the duplicated entry
    const newEntry = await this.articleInvoiceEntryRepository.save(duplicatedEntry);
  
    // Save the new tax entries for the duplicated entry
    await this.articleInvoiceEntryTaxService.saveMany(
      duplicatedTaxes.map((tax) => ({
        taxId: tax.taxId,
        articleInvoiceEntryId: newEntry.id, // Use the new entry's ID
      })),
    );
  
    return newEntry;
  }
  
  async duplicateMany(
    ids: number[],
    invoiceId: number,
  ): Promise<ExpenseArticleInvoiceEntryEntity[]> {
    const duplicatedEntries = [];
    for (const id of ids) {
      const duplicatedEntry = await this.duplicate(id, invoiceId);
      duplicatedEntries.push(duplicatedEntry);
    }
    return duplicatedEntries;
  }

  async softDelete(id: number): Promise<ExpenseArticleInvoiceEntryEntity> {
    const entry = await this.articleInvoiceEntryRepository.findByCondition({
      where: { id, deletedAt: null },
      relations: { expenseArticleInvoiceEntryTaxes: true },
    });
    await this.articleInvoiceEntryTaxService.softDeleteMany(
      entry.expenseArticleInvoiceEntryTaxes.map((taxEntry) => taxEntry.id),
    );
    return this.articleInvoiceEntryRepository.softDelete(id);
  }

  async softDeleteMany(ids: number[]): Promise<ExpenseArticleInvoiceEntryEntity[]> {
    const entries = await Promise.all(
      ids.map(async (id) => this.softDelete(id)),
    );
    return entries;
  }
}
