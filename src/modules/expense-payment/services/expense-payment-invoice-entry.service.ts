import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindOneOptions } from 'typeorm';
import { Transactional } from '@nestjs-cls/transactional';
import { createDineroAmountFromFloatWithDynamicCurrency } from 'src/utils/money.utils';
import * as dinero from 'dinero.js';
import { ExpensePaymentInvoiceEntryRepository } from '../repositories/repository/expense-payment-invoice-entry.entity';
import { ExpenseInvoiceService } from 'src/modules/expense-invoice/services/expense-invoice.service';
import { ExpensePaymentInvoiceEntryEntity } from '../repositories/entities/expense-payment-invoice-entry.entity';
import { ResponseExpensePaymentInvoiceEntryDto } from '../dtos/expense-payment-invoice-entry.response.dto';
import { ExpensePaymentInvoiceEntryNotFoundException } from '../errors/expense-payment-invoice-entry.notfound.error';
import { ExpenseCreatePaymentInvoiceEntryDto } from '../dtos/expense-payment-invoice-entry.create.dto';
import { UpdateExpensePaymentInvoiceEntryDto } from '../dtos/expense-payment-invoice-entry.update.dto';
import { EXPENSE_INVOICE_STATUS } from 'src/modules/expense-invoice/enums/expense-invoice-status.enum';

@Injectable()
export class ExpensePaymentInvoiceEntryService {
  constructor(
    private readonly expensePaymentInvoiceEntryRepository: ExpensePaymentInvoiceEntryRepository,
    private readonly expenseInvoiceService: ExpenseInvoiceService,
  ) {}

  async findOneByCondition(query: IQueryObject): Promise<ExpensePaymentInvoiceEntryEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return this.expensePaymentInvoiceEntryRepository.findOne(queryOptions as FindOneOptions<ExpensePaymentInvoiceEntryEntity>);
  }

  async findOneById(id: number): Promise<ResponseExpensePaymentInvoiceEntryDto> {
    const entry = await this.expensePaymentInvoiceEntryRepository.findOneById(id);
    if (!entry) {
      throw new ExpensePaymentInvoiceEntryNotFoundException();
    }
    return entry;
  }

  @Transactional()
async save(createPaymentInvoiceEntryDto: ExpenseCreatePaymentInvoiceEntryDto): Promise<ExpensePaymentInvoiceEntryEntity> {
  // Récupérer la facture existante
  const existingInvoice = await this.expenseInvoiceService.findOneByCondition({
    filter: `id||$eq||${createPaymentInvoiceEntryDto.expenseInvoiceId}`,
    join: 'currency',
  });

  // Vérifier que la facture existe
  if (!existingInvoice) {
    throw new Error(`Invoice with ID ${createPaymentInvoiceEntryDto.expenseInvoiceId} not found`);
  }

  // Set default value for amountPaid if it is null or undefined
  if (existingInvoice.amountPaid === null || existingInvoice.amountPaid === undefined) {
    existingInvoice.amountPaid = 0;
  }

  // Continuer avec la logique de sauvegarde
  const zero = dinero({
    amount: createDineroAmountFromFloatWithDynamicCurrency(0, createPaymentInvoiceEntryDto.digitAfterComma),
    precision: createPaymentInvoiceEntryDto.digitAfterComma,
  });

  const amountAlreadyPaid = dinero({
    amount: createDineroAmountFromFloatWithDynamicCurrency(existingInvoice.amountPaid, existingInvoice.currency.digitAfterComma),
    precision: existingInvoice.currency.digitAfterComma,
  });

  const amountToBePaid = dinero({
    amount: createDineroAmountFromFloatWithDynamicCurrency(createPaymentInvoiceEntryDto.amount, createPaymentInvoiceEntryDto.digitAfterComma),
    precision: createPaymentInvoiceEntryDto.digitAfterComma,
  });

  const totalAmountPaid = amountAlreadyPaid.add(amountToBePaid);

  const invoiceTotal = dinero({
    amount: createDineroAmountFromFloatWithDynamicCurrency(existingInvoice.total, existingInvoice.currency.digitAfterComma),
    precision: existingInvoice.currency.digitAfterComma,
  });

  const newInvoiceStatus =
    totalAmountPaid.equalsTo(zero)
      ? EXPENSE_INVOICE_STATUS.Unpaid
      : totalAmountPaid.equalsTo(invoiceTotal)
        ? EXPENSE_INVOICE_STATUS.Paid
        : EXPENSE_INVOICE_STATUS.PartiallyPaid;

  const result = await this.expenseInvoiceService.updateFields(existingInvoice.id, {
    amountPaid: totalAmountPaid.toUnit(),
    status: newInvoiceStatus,
  });

  console.log('Update result:', result);

  return this.expensePaymentInvoiceEntryRepository.save(createPaymentInvoiceEntryDto);
}
  @Transactional()
  async saveMany(
    createPaymentInvoiceEntryDtos: ExpenseCreatePaymentInvoiceEntryDto[],
  ): Promise<{ savedEntries: ExpensePaymentInvoiceEntryEntity[]; skippedEntries: ExpenseCreatePaymentInvoiceEntryDto[] }> {
    const savedEntries = [];
    const skippedEntries = [];
  
    for (const dto of createPaymentInvoiceEntryDtos) {
      try {
        // Skip null or invalid DTOs
        if (!dto || !dto.expenseInvoiceId) {
          console.warn(`Skipping invalid invoice entry: expenseInvoiceId is missing in DTO`, dto);
          skippedEntries.push(dto);
          continue;
        }
    
        // Save the valid entry
        const savedEntry = await this.save(dto);
        savedEntries.push(savedEntry);
      } catch (error) {
        console.error(`Failed to save invoice entry:`, error);
        skippedEntries.push(dto);
      }
    }
  
    return { savedEntries, skippedEntries };
  }
  
  @Transactional()
  async update(
    id: number,
    updatePaymentInvoiceEntryDto: UpdateExpensePaymentInvoiceEntryDto,
  ): Promise<ExpensePaymentInvoiceEntryEntity> {
    const existingEntry = await this.findOneById(id);

    const existingInvoice = await this.expenseInvoiceService.findOneByCondition({
      filter: `id||$eq||${existingEntry.expenseInvoiceId}`,
      join: 'currency',
    });

    const currentAmountPaid = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.amountPaid,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const oldEntryAmount = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingEntry.amount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const updatedEntryAmount = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        updatePaymentInvoiceEntryDto.amount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const taxWithholdingAmount = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.taxWithholdingAmount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const newAmountPaid = currentAmountPaid
      .subtract(oldEntryAmount)
      .add(updatedEntryAmount);

    const zero = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        0,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const invoiceTotal = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.total,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const newInvoiceStatus = newAmountPaid.equalsTo(zero)
      ? EXPENSE_INVOICE_STATUS.Unpaid
      : newAmountPaid.add(taxWithholdingAmount).equalsTo(invoiceTotal)
        ? EXPENSE_INVOICE_STATUS.Paid
        : EXPENSE_INVOICE_STATUS.PartiallyPaid;

    await this.expenseInvoiceService.updateFields(existingInvoice.id, {
      amountPaid: newAmountPaid.toUnit(),
      status: newInvoiceStatus,
    });

    return this.expensePaymentInvoiceEntryRepository.save({
      ...existingEntry,
      ...updatePaymentInvoiceEntryDto,
    });
  }

  @Transactional()
  async softDelete(id: number): Promise<ExpensePaymentInvoiceEntryEntity> {
    const existingEntry = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'payment',
    });

    const existingInvoice = await this.expenseInvoiceService.findOneByCondition({
      filter: `id||$eq||${existingEntry.expenseInvoiceId}`,
      join: 'currency',
    });

    const zero = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        0,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const totalAmountPaid = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.amountPaid,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const amountToDeduct = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingEntry.amount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const taxWithholdingAmount = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.taxWithholdingAmount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const updatedAmountPaid = totalAmountPaid.subtract(amountToDeduct);

    const invoiceTotal = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.total,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const newInvoiceStatus = updatedAmountPaid.equalsTo(zero)
      ? EXPENSE_INVOICE_STATUS.Unpaid
      : updatedAmountPaid.add(taxWithholdingAmount).equalsTo(invoiceTotal)
        ? EXPENSE_INVOICE_STATUS.Paid
        : EXPENSE_INVOICE_STATUS.PartiallyPaid;

    await this.expenseInvoiceService.updateFields(existingInvoice.id, {
      amountPaid: updatedAmountPaid.toUnit(),
      status: newInvoiceStatus,
    });
    return this.expensePaymentInvoiceEntryRepository.softDelete(id);
  }

  @Transactional()
  async softDeleteMany(ids: number[]): Promise<void> {
    for (const id of ids) {
      await this.softDelete(id);
    }
  }
}
