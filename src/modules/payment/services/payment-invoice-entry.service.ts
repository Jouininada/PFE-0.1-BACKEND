import { Injectable } from '@nestjs/common';
import { PaymentInvoiceEntryRepository } from '../repositories/repository/payment-invoice-entry.entity';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { ResponsePaymentInvoiceEntryDto } from '../dtos/payment-invoice-entry.response.dto';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindOneOptions } from 'typeorm';
import { PaymentInvoiceEntryEntity } from '../repositories/entities/payment-invoice-entry.entity';
import { PaymentInvoiceEntryNotFoundException } from '../errors/payment-invoice-entry.notfound.error';
import { CreatePaymentInvoiceEntryDto } from '../dtos/payment-invoice-entry.create.dto';
import { UpdatePaymentInvoiceEntryDto } from '../dtos/payment-invoice-entry.update.dto';
import { InvoiceService } from 'src/modules/invoice/services/invoice.service';
import { Transactional } from '@nestjs-cls/transactional';
import { INVOICE_STATUS } from 'src/modules/invoice/enums/invoice-status.enum';
import { createDineroAmountFromFloatWithDynamicCurrency } from 'src/utils/money.utils';
import * as dinero from 'dinero.js';

@Injectable()
export class PaymentInvoiceEntryService {
  constructor(
    private readonly paymentInvoiceEntryRepository: PaymentInvoiceEntryRepository,
    private readonly invoiceService: InvoiceService,
  ) {}

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<PaymentInvoiceEntryEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const entry = await this.paymentInvoiceEntryRepository.findOne(
      queryOptions as FindOneOptions<PaymentInvoiceEntryEntity>,
    );
    if (!entry) return null;
    return entry;
  }

  async findOneById(id: number): Promise<ResponsePaymentInvoiceEntryDto> {
    const entry = await this.paymentInvoiceEntryRepository.findOneById(id);
    if (!entry) {
      throw new PaymentInvoiceEntryNotFoundException();
    }
    return entry;
  }

  @Transactional()
  async save(
    createPaymentInvoiceEntryDto: CreatePaymentInvoiceEntryDto,
  ): Promise<PaymentInvoiceEntryEntity> {
    const existingInvoice = await this.invoiceService.findOneByCondition({
      filter: `id||$eq||${createPaymentInvoiceEntryDto.invoiceId}`,
      join: 'currency',
    });

    const zero = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        0,
        createPaymentInvoiceEntryDto.digitAfterComma,
      ),
      precision: createPaymentInvoiceEntryDto.digitAfterComma,
    });

    const amountAlreadyPaid = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.amountPaid,
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

    const amountToBePaid = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        createPaymentInvoiceEntryDto.amount,
        createPaymentInvoiceEntryDto.digitAfterComma,
      ),
      precision: createPaymentInvoiceEntryDto.digitAfterComma,
    });

    const totalAmountPaid = amountAlreadyPaid.add(amountToBePaid);

    const invoiceTotal = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.total,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const newInvoiceStatus = totalAmountPaid.equalsTo(zero)
      ? INVOICE_STATUS.Unpaid
      : totalAmountPaid.add(taxWithholdingAmount).equalsTo(invoiceTotal)
        ? INVOICE_STATUS.Paid
        : INVOICE_STATUS.PartiallyPaid;

    await this.invoiceService.updateFields(existingInvoice.id, {
      amountPaid: totalAmountPaid.toUnit(),
      status: newInvoiceStatus,
    });

    return this.paymentInvoiceEntryRepository.save(
      createPaymentInvoiceEntryDto,
    );
  }

  @Transactional()
  async saveMany(
    createPaymentInvoiceEntryDtos: CreatePaymentInvoiceEntryDto[],
  ): Promise<PaymentInvoiceEntryEntity[]> {
    const savedEntries = [];
    for (const dto of createPaymentInvoiceEntryDtos) {
      const savedEntry = await this.save(dto);
      savedEntries.push(savedEntry);
    }
    return savedEntries;
  }

  @Transactional()
  async update(
    id: number,
    updatePaymentInvoiceEntryDto: UpdatePaymentInvoiceEntryDto,
  ): Promise<PaymentInvoiceEntryEntity> {
    const existingEntry = await this.findOneById(id);

    const existingInvoice = await this.invoiceService.findOneByCondition({
      filter: `id||$eq||${existingEntry.invoiceId}`,
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
      ? INVOICE_STATUS.Unpaid
      : newAmountPaid.add(taxWithholdingAmount).equalsTo(invoiceTotal)
        ? INVOICE_STATUS.Paid
        : INVOICE_STATUS.PartiallyPaid;

    await this.invoiceService.updateFields(existingInvoice.id, {
      amountPaid: newAmountPaid.toUnit(),
      status: newInvoiceStatus,
    });

    return this.paymentInvoiceEntryRepository.save({
      ...existingEntry,
      ...updatePaymentInvoiceEntryDto,
    });
  }

  @Transactional()
  async softDelete(id: number): Promise<PaymentInvoiceEntryEntity> {
    const existingEntry = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'payment',
    });

    const existingInvoice = await this.invoiceService.findOneByCondition({
      filter: `id||$eq||${existingEntry.invoiceId}`,
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
      ? INVOICE_STATUS.Unpaid
      : updatedAmountPaid.add(taxWithholdingAmount).equalsTo(invoiceTotal)
        ? INVOICE_STATUS.Paid
        : INVOICE_STATUS.PartiallyPaid;

    await this.invoiceService.updateFields(existingInvoice.id, {
      amountPaid: updatedAmountPaid.toUnit(),
      status: newInvoiceStatus,
    });

    return this.paymentInvoiceEntryRepository.softDelete(id);
  }

  @Transactional()
  async softDeleteMany(ids: number[]): Promise<void> {
    for (const id of ids) {
      await this.softDelete(id);
    }
  }
}
