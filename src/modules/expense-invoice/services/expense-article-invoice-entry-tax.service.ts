import { Injectable } from '@nestjs/common';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { ExpenseArticleInvoiceEntryTaxRepository } from '../repositories/repository/expense-invoice-article-entry-tax.repository';
import { ExpenseCreateArticleInvoiceEntryTaxDto } from '../dtos/expense-article-invoice-entry-tax.create.dto';
import { ExpenseArticleInvoiceEntryTaxEntity } from '../repositories/entities/expense-article-invoice-entry-tax.entity';

@Injectable()
export class ExpenseArticleInvoiceEntryTaxService {
  constructor(
    private readonly articleInvoiceEntryTaxRepository: ExpenseArticleInvoiceEntryTaxRepository,
    private readonly taxService: TaxService,
  ) {}

  async save(
    createArticleInvoiceEntryTaxDto: ExpenseCreateArticleInvoiceEntryTaxDto,
  ): Promise<ExpenseArticleInvoiceEntryTaxEntity> {
    const tax = await this.taxService.findOneById(
      createArticleInvoiceEntryTaxDto.taxId,
    );
    const taxEntry = await this.articleInvoiceEntryTaxRepository.save({
      expenseArticleInvoiceEntryId:
        createArticleInvoiceEntryTaxDto.articleInvoiceEntryId,
      tax,
    });
    return taxEntry;
  }

  async saveMany(
    createArticleInvoiceEntryTaxDtos: ExpenseCreateArticleInvoiceEntryTaxDto[],
  ): Promise<ExpenseArticleInvoiceEntryTaxEntity[]> {
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
