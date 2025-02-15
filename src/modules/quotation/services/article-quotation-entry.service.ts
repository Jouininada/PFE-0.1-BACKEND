import { Injectable } from '@nestjs/common';
import { ArticleQuotationEntryEntity } from '../repositories/entities/article-quotation-entry.entity';
import { CreateArticleQuotationEntryDto } from '../dtos/article-quotation-entry.create.dto';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { ArticleService } from 'src/modules/article/services/article.service';
import { ResponseArticleDto } from 'src/modules/article/dtos/article.response.dto';
import { UpdateArticleQuotationEntryDto } from '../dtos/article-quotation-entry.update.dto';
import { InvoicingCalculationsService } from 'src/common/calculations/services/invoicing.calculations.service';
import { ResponseArticleQuotationEntryDto } from '../dtos/article-quotation-entry.response.dto';
import { ArticleQuotationEntryRepository } from '../repositories/repository/article-quotation-entry.repository';
import { ArticleQuotationEntryTaxService } from './article-quotation-entry-tax.service';
import { ArticleQuotationEntryNotFoundException } from '../errors/article-quotation-entry.notfound.error';
import { LineItem } from 'src/common/calculations/interfaces/line-item.interface';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindOneOptions } from 'typeorm';

@Injectable()
export class ArticleQuotationEntryService {
  constructor(
    private readonly articleQuotationEntryRepository: ArticleQuotationEntryRepository,
    private readonly articleQuotationEntryTaxService: ArticleQuotationEntryTaxService,
    private readonly articleService: ArticleService,
    private readonly taxService: TaxService,
    private readonly calculationsService: InvoicingCalculationsService,
  ) {}

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseArticleQuotationEntryDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const entry = await this.articleQuotationEntryRepository.findOne(
      queryOptions as FindOneOptions<ArticleQuotationEntryEntity>,
    );
    if (!entry) return null;
    return entry;
  }

  async findOneById(id: number): Promise<ResponseArticleQuotationEntryDto> {
    const entry = await this.articleQuotationEntryRepository.findOneById(id);
    if (!entry) {
      throw new ArticleQuotationEntryNotFoundException();
    }
    return entry;
  }

  async findOneAsLineItem(id: number): Promise<LineItem> {
    const entry = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'articleQuotationEntryTaxes',
    });
    const taxes = entry.articleQuotationEntryTaxes
      ? await Promise.all(
          entry.articleQuotationEntryTaxes.map((taxEntry) =>
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
    createArticleQuotationEntryDto: CreateArticleQuotationEntryDto,
  ): Promise<ArticleQuotationEntryEntity> {
    const taxes = createArticleQuotationEntryDto.taxes
      ? await Promise.all(
          createArticleQuotationEntryDto.taxes.map((id) =>
            this.taxService.findOneById(id),
          ),
        )
      : [];

    const article =
      (await this.articleService.findOneByCondition({
        filter: `title||$eq||${createArticleQuotationEntryDto.article.title}`,
      })) ||
      (await this.articleService.save(createArticleQuotationEntryDto.article));

    const lineItem = {
      quantity: createArticleQuotationEntryDto.quantity,
      unit_price: createArticleQuotationEntryDto.unit_price,
      discount: createArticleQuotationEntryDto.discount,
      discount_type: createArticleQuotationEntryDto.discount_type,
      taxes: taxes,
    };

    const entry = await this.articleQuotationEntryRepository.save({
      ...createArticleQuotationEntryDto,
      articleId: article.id,
      article: article,
      subTotal: this.calculationsService.calculateSubTotalForLineItem(lineItem),
      total: this.calculationsService.calculateTotalForLineItem(lineItem),
    });

    await this.articleQuotationEntryTaxService.saveMany(
      taxes.map((tax) => {
        return {
          taxId: tax.id,
          articleQuotationEntryId: entry.id,
        };
      }),
    );
    return entry;
  }

  async saveMany(
    createArticleQuotationEntryDtos: CreateArticleQuotationEntryDto[],
  ): Promise<ArticleQuotationEntryEntity[]> {
    const savedEntries = [];
    for (const dto of createArticleQuotationEntryDtos) {
      const savedEntry = await this.save(dto);
      savedEntries.push(savedEntry);
    }
    return savedEntries;
  }

  async update(
    id: number,
    updateArticleQuotationEntryDto: UpdateArticleQuotationEntryDto,
  ): Promise<ArticleQuotationEntryEntity> {
    //fetch exisiting entry
    const existingEntry =
      await this.articleQuotationEntryRepository.findOneById(id);
    this.articleQuotationEntryTaxService.softDeleteMany(
      existingEntry.articleQuotationEntryTaxes.map((taxEntry) => taxEntry.id),
    );

    //fetch and check the existance of all taxes
    const taxes = updateArticleQuotationEntryDto.taxes
      ? await Promise.all(
          updateArticleQuotationEntryDto.taxes.map((id) =>
            this.taxService.findOneById(id),
          ),
        )
      : [];

    //delete all existing taxes and rebuild
    for (const taxEntry of existingEntry.articleQuotationEntryTaxes) {
      this.articleQuotationEntryTaxService.softDelete(taxEntry.id);
    }

    //save and check of articles existance , if a given article doesn't exist by name , it will be created
    let article: ResponseArticleDto;
    try {
      article = await this.articleService.findOneByCondition({
        filter: `title||$eq||${updateArticleQuotationEntryDto.article.title}`,
      });
    } catch (error) {
      article = await this.articleService.save(
        updateArticleQuotationEntryDto.article,
      );
    }

    const lineItem = {
      quantity: updateArticleQuotationEntryDto.quantity,
      unit_price: updateArticleQuotationEntryDto.unit_price,
      discount: updateArticleQuotationEntryDto.discount,
      discount_type: updateArticleQuotationEntryDto.discount_type,
      taxes: taxes,
    };

    //update the entry with the new data and save it
    const entry = await this.articleQuotationEntryRepository.save({
      ...existingEntry,
      ...updateArticleQuotationEntryDto,
      articleId: article.id,
      article: article,
      subTotal: this.calculationsService.calculateSubTotalForLineItem(lineItem),
      total: this.calculationsService.calculateTotalForLineItem(lineItem),
    });
    //save the new tax entries for the article entry
    await this.articleQuotationEntryTaxService.saveMany(
      taxes.map((tax) => {
        return {
          taxId: tax.id,
          articleQuotationEntryId: entry.id,
        };
      }),
    );
    return entry;
  }

  async duplicate(
    id: number,
    quotationId: number,
  ): Promise<ArticleQuotationEntryEntity> {
    // Fetch the existing entry
    const existingEntry = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'articleQuotationEntryTaxes',
    });

    // Duplicate the taxes associated with this entry
    const duplicatedTaxes = existingEntry.articleQuotationEntryTaxes.map(
      (taxEntry) => ({
        taxId: taxEntry.taxId,
      }),
    );

    // Create the duplicated entry
    const duplicatedEntry = {
      ...existingEntry,
      quotationId: quotationId,
      id: undefined,
      articleQuotationEntryTaxes: duplicatedTaxes, // Attach duplicated taxes
      createdAt: undefined,
      updatedAt: undefined,
    };

    // Save the duplicated entry
    const newEntry =
      await this.articleQuotationEntryRepository.save(duplicatedEntry);

    // Save the new tax entries for the duplicated entry
    await this.articleQuotationEntryTaxService.saveMany(
      duplicatedTaxes.map((tax) => ({
        taxId: tax.taxId,
        articleQuotationEntryId: newEntry.id,
      })),
    );

    return newEntry;
  }

  async duplicateMany(
    ids: number[],
    quotationId: number,
  ): Promise<ArticleQuotationEntryEntity[]> {
    const duplicatedEntries = [];
    for (const id of ids) {
      const duplicatedEntry = await this.duplicate(id, quotationId);
      duplicatedEntries.push(duplicatedEntry);
    }
    return duplicatedEntries;
  }

  async softDelete(id: number): Promise<ArticleQuotationEntryEntity> {
    const entry = await this.articleQuotationEntryRepository.findByCondition({
      where: { id, deletedAt: null },
      relations: { articleQuotationEntryTaxes: true },
    });
    await this.articleQuotationEntryTaxService.softDeleteMany(
      entry.articleQuotationEntryTaxes.map((taxEntry) => taxEntry.id),
    );
    return this.articleQuotationEntryRepository.softDelete(id);
  }

  async softDeleteMany(ids: number[]): Promise<ArticleQuotationEntryEntity[]> {
    const entries = await Promise.all(
      ids.map(async (id) => this.softDelete(id)),
    );
    return entries;
  }
}
