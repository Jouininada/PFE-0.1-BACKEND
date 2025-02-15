import { Injectable } from '@nestjs/common';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { ArticleInvoiceEntryTaxRepository } from '../repositories/repository/article-invoice-entry-tax.repository';
import { ArticleInvoiceEntryTaxEntity } from '../repositories/entities/article-invoice-entry-tax.entity';
import { CreateArticleInvoiceEntryTaxDto } from '../dtos/article-invoice-entry-tax.create.dto';

@Injectable()
export class ArticleInvoiceEntryTaxService {
  constructor(
    private readonly articleInvoiceEntryTaxRepository: ArticleInvoiceEntryTaxRepository,
    private readonly taxService: TaxService,
  ) {}

  async save(
    createArticleInvoiceEntryTaxDto: CreateArticleInvoiceEntryTaxDto,
  ): Promise<ArticleInvoiceEntryTaxEntity> {
    const tax = await this.taxService.findOneById(
      createArticleInvoiceEntryTaxDto.taxId,
    );
    const taxEntry = await this.articleInvoiceEntryTaxRepository.save({
      articleInvoiceEntryId:
        createArticleInvoiceEntryTaxDto.articleInvoiceEntryId,
      tax,
    });
    return taxEntry;
  }

  async saveMany(
    createArticleInvoiceEntryTaxDtos: CreateArticleInvoiceEntryTaxDto[],
  ): Promise<ArticleInvoiceEntryTaxEntity[]> {
    const savedEntries = [];
    for (const dto of createArticleInvoiceEntryTaxDtos) {
      const savedEntry = await this.save(dto);
      savedEntries.push(savedEntry);
    }
    return savedEntries;
  }

  async softDelete(id: number): Promise<void> {
    await this.articleInvoiceEntryTaxRepository.softDelete(id);
  }

  async softDeleteMany(ids: number[]): Promise<void> {
    ids.forEach(async (id) => await this.softDelete(id));
  }
}
