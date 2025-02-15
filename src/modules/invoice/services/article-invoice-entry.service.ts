import { Injectable } from '@nestjs/common';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { ArticleService } from 'src/modules/article/services/article.service';
import { ResponseArticleDto } from 'src/modules/article/dtos/article.response.dto';
import { InvoicingCalculationsService } from 'src/common/calculations/services/invoicing.calculations.service';
import { LineItem } from 'src/common/calculations/interfaces/line-item.interface';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindOneOptions } from 'typeorm';
import { ArticleInvoiceEntryRepository } from '../repositories/repository/article-invoice-entry.repository';
import { ArticleInvoiceEntryTaxService } from './article-invoice-entry-tax.service';
import { ResponseArticleInvoiceEntryDto } from '../dtos/article-invoice-entry.response.dto';
import { ArticleInvoiceEntryEntity } from '../repositories/entities/article-invoice-entry.entity';
import { ArticleInvoiceEntryNotFoundException } from '../errors/article-invoice-entry.notfound.error';
import { CreateArticleInvoiceEntryDto } from '../dtos/article-invoice-entry.create.dto';
import { UpdateArticleInvoiceEntryDto } from '../dtos/article-invoice-entry.update.dto';

@Injectable()
export class ArticleInvoiceEntryService {
  constructor(
    private readonly articleInvoiceEntryRepository: ArticleInvoiceEntryRepository,
    private readonly articleInvoiceEntryTaxService: ArticleInvoiceEntryTaxService,
    private readonly articleService: ArticleService,
    private readonly taxService: TaxService,
    private readonly calculationsService: InvoicingCalculationsService,
  ) {}

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseArticleInvoiceEntryDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const entry = await this.articleInvoiceEntryRepository.findOne(
      queryOptions as FindOneOptions<ArticleInvoiceEntryEntity>,
    );
    if (!entry) return null;
    return entry;
  }

  async findOneById(id: number): Promise<ResponseArticleInvoiceEntryDto> {
    const entry = await this.articleInvoiceEntryRepository.findOneById(id);
    if (!entry) {
      throw new ArticleInvoiceEntryNotFoundException();
    }
    return entry;
  }

  async findOneAsLineItem(id: number): Promise<LineItem> {
    const entry = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'articleInvoiceEntryTaxes',
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
    createArticleInvoiceEntryDto: CreateArticleInvoiceEntryDto,
  ): Promise<ArticleInvoiceEntryEntity> {
    const taxes = createArticleInvoiceEntryDto.taxes
      ? await Promise.all(
          createArticleInvoiceEntryDto.taxes.map((id) =>
            this.taxService.findOneById(id),
          ),
        )
      : [];

    const article =
      (await this.articleService.findOneByCondition({
        filter: `title||$eq||${createArticleInvoiceEntryDto.article.title}`,
      })) ||
      (await this.articleService.save(createArticleInvoiceEntryDto.article));

    const lineItem = {
      quantity: createArticleInvoiceEntryDto.quantity,
      unit_price: createArticleInvoiceEntryDto.unit_price,
      discount: createArticleInvoiceEntryDto.discount,
      discount_type: createArticleInvoiceEntryDto.discount_type,
      taxes: taxes,
    };

    const entry = await this.articleInvoiceEntryRepository.save({
      ...createArticleInvoiceEntryDto,
      articleId: article.id,
      article: article,
      subTotal: this.calculationsService.calculateSubTotalForLineItem(lineItem),
      total: this.calculationsService.calculateTotalForLineItem(lineItem),
    });

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

  async saveMany(
    createArticleInvoiceEntryDtos: CreateArticleInvoiceEntryDto[],
  ): Promise<ArticleInvoiceEntryEntity[]> {
    const savedEntries = [];
    for (const dto of createArticleInvoiceEntryDtos) {
      const savedEntry = await this.save(dto);
      savedEntries.push(savedEntry);
    }
    return savedEntries;
  }

  async update(
    id: number,
    updateArticleInvoiceEntryDto: UpdateArticleInvoiceEntryDto,
  ): Promise<ArticleInvoiceEntryEntity> {
    //fetch exisiting entry
    const existingEntry =
      await this.articleInvoiceEntryRepository.findOneById(id);
    this.articleInvoiceEntryTaxService.softDeleteMany(
      existingEntry.articleInvoiceEntryTaxes.map((taxEntry) => taxEntry.id),
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
    for (const taxEntry of existingEntry.articleInvoiceEntryTaxes) {
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
  ): Promise<ArticleInvoiceEntryEntity> {
    // Fetch the existing entry
    const existingEntry = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'articleInvoiceEntryTaxes',
    });

    // Duplicate the taxes associated with this entry
    const duplicatedTaxes = existingEntry.articleInvoiceEntryTaxes.map(
      (taxEntry) => ({
        taxId: taxEntry.taxId,
      }),
    );

    // Create the duplicated entry
    const duplicatedEntry = {
      ...existingEntry,
      invoiceId: invoiceId,
      id: undefined,
      articleInvoiceEntryTaxes: duplicatedTaxes, // Attach duplicated taxes
      createdAt: undefined,
      updatedAt: undefined,
    };

    // Save the duplicated entry
    const newEntry =
      await this.articleInvoiceEntryRepository.save(duplicatedEntry);

    // Save the new tax entries for the duplicated entry
    await this.articleInvoiceEntryTaxService.saveMany(
      duplicatedTaxes.map((tax) => ({
        taxId: tax.taxId,
        articleInvoiceEntryId: newEntry.id,
      })),
    );

    return newEntry;
  }

  async duplicateMany(
    ids: number[],
    invoiceId: number,
  ): Promise<ArticleInvoiceEntryEntity[]> {
    const duplicatedEntries = [];
    for (const id of ids) {
      const duplicatedEntry = await this.duplicate(id, invoiceId);
      duplicatedEntries.push(duplicatedEntry);
    }
    return duplicatedEntries;
  }

  async softDelete(id: number): Promise<ArticleInvoiceEntryEntity> {
    const entry = await this.articleInvoiceEntryRepository.findByCondition({
      where: { id, deletedAt: null },
      relations: { articleInvoiceEntryTaxes: true },
    });
    await this.articleInvoiceEntryTaxService.softDeleteMany(
      entry.articleInvoiceEntryTaxes.map((taxEntry) => taxEntry.id),
    );
    return this.articleInvoiceEntryRepository.softDelete(id);
  }

  async softDeleteMany(ids: number[]): Promise<ArticleInvoiceEntryEntity[]> {
    const entries = await Promise.all(
      ids.map(async (id) => this.softDelete(id)),
    );
    return entries;
  }
}
