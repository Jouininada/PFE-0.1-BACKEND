import { Injectable } from '@nestjs/common';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { CreateArticleQuotationEntryTaxDto } from '../dtos/article-quotation-entry-tax.create.dto';
import { ArticleQuotationEntryTaxEntity } from '../repositories/entities/article-quotation-entry-tax.entity';
import { ArticleQuotationEntryTaxRepository } from '../repositories/repository/article-quotation-entry-tax.repository';

@Injectable()
export class ArticleQuotationEntryTaxService {
  constructor(
    private readonly articleQuotationEntryTaxRepository: ArticleQuotationEntryTaxRepository,
    private readonly taxService: TaxService,
  ) {}

  async save(
    createArticleQuotationEntryTaxDto: CreateArticleQuotationEntryTaxDto,
  ): Promise<ArticleQuotationEntryTaxEntity> {
    const tax = await this.taxService.findOneById(
      createArticleQuotationEntryTaxDto.taxId,
    );
    const taxEntry = await this.articleQuotationEntryTaxRepository.save({
      articleQuotationEntryId:
        createArticleQuotationEntryTaxDto.articleQuotationEntryId,
      tax,
    });
    return taxEntry;
  }

  async saveMany(
    createArticleQuotationEntryTaxDtos: CreateArticleQuotationEntryTaxDto[],
  ): Promise<ArticleQuotationEntryTaxEntity[]> {
    const savedEntries = [];
    for (const dto of createArticleQuotationEntryTaxDtos) {
      const savedEntry = await this.save(dto);
      savedEntries.push(savedEntry);
    }
    return savedEntries;
  }

  async softDelete(id: number): Promise<void> {
    await this.articleQuotationEntryTaxRepository.softDelete(id);
  }

  async softDeleteMany(ids: number[]): Promise<void> {
    ids.forEach(async (id) => await this.softDelete(id));
  }
}
