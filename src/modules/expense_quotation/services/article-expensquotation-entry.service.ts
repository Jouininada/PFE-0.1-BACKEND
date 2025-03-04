/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ArticleExpensQuotationEntryEntity } from '../repositories/entities/article-expensquotation-entry.entity';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { ArticleService } from 'src/modules/article/services/article.service';
import { ResponseArticleDto } from 'src/modules/article/dtos/article.response.dto';
import { InvoicingCalculationsService } from 'src/common/calculations/services/invoicing.calculations.service';
import { LineItem } from 'src/common/calculations/interfaces/line-item.interface';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindOneOptions } from 'typeorm';
import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { ArticleExpensQuotationEntryTaxService } from './article-expensquotation-entry-tax.service';
import { CreateArticleExpensQuotationEntryDto } from '../dtos/article-expensquotation-entry.create.dto';
import { ResponseArticleExpensQuotationEntryDto } from '../dtos/article-expensquotation-entry.response.dto';
import { ExpenseArticleQuotationEntryRepository } from '../repositories/repository/article-expensquotation-entry.repository';

@Injectable()
export class ArticleExpensQuotationEntryService {
    constructor(
        private readonly expensQuotationEntryRepository: ExpenseArticleQuotationEntryRepository,
        private readonly expensQuotationEntryTaxService: ArticleExpensQuotationEntryTaxService,
        private readonly articleService: ArticleService,
        private readonly taxService: TaxService,
        private readonly calculationsService: InvoicingCalculationsService,
    ) {}

    async saveMany(
        createArticleExpensQuotationEntryDtos: CreateArticleExpensQuotationEntryDto[],
    ): Promise<ArticleExpensQuotationEntryEntity[]> {
        const savedEntries = [];
        for (const dto of createArticleExpensQuotationEntryDtos) {
            const savedEntry = await this.save(dto);
            savedEntries.push(savedEntry);
        }
        return savedEntries;
    }

    async save(
        createArticleExpensQuotationEntryDto: CreateArticleExpensQuotationEntryDto,
    ): Promise<ArticleExpensQuotationEntryEntity> {
        try {
            // Vérification et récupération des taxes
            const taxes = createArticleExpensQuotationEntryDto.taxes
                ? await Promise.all(
                    createArticleExpensQuotationEntryDto.taxes.map(async (id) => {
                        const tax = await this.taxService.findOneById(id);
                        if (!tax) {
                            throw new Error(`Tax with id ${id} not found`);
                        }
                        return tax;
                    }),
                )
                : [];

            // Vérification et création de l'article si nécessaire
            const article =
                (await this.articleService.findOneByCondition({
                    filter: `title||$eq||${createArticleExpensQuotationEntryDto.article.title}`,
                })) ||
                (await this.articleService.save(createArticleExpensQuotationEntryDto.article));

            const lineItem = {
                quantity: createArticleExpensQuotationEntryDto.quantity,
                unit_price: createArticleExpensQuotationEntryDto.unit_price,
                discount: createArticleExpensQuotationEntryDto.discount,
                discount_type: createArticleExpensQuotationEntryDto.discount_type,
                taxes: taxes,
            };

            // Sauvegarde de l'entrée de devis
            const entry = await this.expensQuotationEntryRepository.save({
                ...createArticleExpensQuotationEntryDto,
                articleId: article.id,
                article: article,
                subTotal: this.calculationsService.calculateSubTotalForLineItem(lineItem),
                total: this.calculationsService.calculateTotalForLineItem(lineItem),
            });

            // Sauvegarde des taxes associées
            await this.expensQuotationEntryTaxService.saveMany(
                taxes.map((tax) => {
                    return {
                        taxId: tax.id,
                        articleExpensQuotationEntryId: entry.id,
                    };
                }),
            );
            return entry;
        } catch (error) {
            throw new Error(`Error saving article expens quotation entry: ${error.message}`);
        }
    }

    async findManyAsLineItem(ids: number[]): Promise<LineItem[]> {
        const lineItems = await Promise.all(
            ids.map((id) => this.findOneAsLineItem(id)),
        );
        return lineItems;
    }

    async findOneAsLineItem(id: number): Promise<LineItem> {
        const entry = await this.findOneByCondition({
            filter: `id||$eq||${id}`,
            join: 'articleExpensQuotationEntryTaxes',
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

    async findOneByCondition(
        query: IQueryObject,
    ): Promise<ResponseArticleExpensQuotationEntryDto | null> {
        const queryBuilder = new QueryBuilder();
        const queryOptions = queryBuilder.build(query);
        const entry = await this.expensQuotationEntryRepository.findOne(
            queryOptions as FindOneOptions<ArticleExpensQuotationEntryEntity>,
        );
        if (!entry) return null;
        return entry;
    }

    async duplicate(
        id: number,
        expensQuotationId: number,
    ): Promise<ArticleExpensQuotationEntryEntity> {
        // Fetch the existing entry
        const existingEntry = await this.findOneByCondition({
            filter: `id||$eq||${id}`,
            join: 'articleExpensQuotationEntryTaxes',
        });
    
        if (!existingEntry) {
            throw new Error('Entry not found');
        }
    
        // Ensure articleQuotationEntryTaxes is defined
        if (!existingEntry.articleQuotationEntryTaxes) {
            existingEntry.articleQuotationEntryTaxes = [];
        }
    
        // Duplicate the taxes associated with this entry
        const duplicatedTaxes = existingEntry.articleQuotationEntryTaxes.map(
            (taxEntry) => ({
                taxId: taxEntry.taxId,
            }),
        );
    
        // Create the duplicated entry
        const duplicatedEntry = {
            ...existingEntry,
            expensQuotationId: expensQuotationId,
            id: undefined,
            articleExpensQuotationEntryTaxes: duplicatedTaxes, // Attach duplicated taxes
            createdAt: undefined,
            updatedAt: undefined,
        };
    
        // Save the duplicated entry
        const newEntry =
            await this.expensQuotationEntryRepository.save(duplicatedEntry);
    
        // Save the new tax entries for the duplicated entry
        await this.expensQuotationEntryTaxService.saveMany(
            duplicatedTaxes.map((tax) => ({
                taxId: tax.taxId,
                articleExpensQuotationEntryId: newEntry.id,
            })),
        );
    
        return newEntry;
    }

    async duplicateMany(
        ids: number[],
        expensQuotationId: number,
    ): Promise<ArticleExpensQuotationEntryEntity[]> {
        const duplicatedEntries = [];
        for (const id of ids) {
            const duplicatedEntry = await this.duplicate(id, expensQuotationId);
            duplicatedEntries.push(duplicatedEntry);
        }
        return duplicatedEntries;
    }


    async softDelete(id: number): Promise<ArticleExpensQuotationEntryEntity> {
        const entry = await this.expensQuotationEntryRepository.findByCondition({
          where: { id, deletedAt: null },
          relations: { articleExpensQuotationEntryTaxes: true },
        });
        await this.expensQuotationEntryTaxService.softDeleteMany(
          entry.articleExpensQuotationEntryTaxes.map((taxEntry) => taxEntry.id),
        );
        return this.expensQuotationEntryRepository.softDelete(id);
      }
    
      async softDeleteMany(ids: number[]): Promise<ArticleExpensQuotationEntryEntity[]> {
        const entries = await Promise.all(
          ids.map(async (id) => this.softDelete(id)),
        );
        return entries;
      }
}
