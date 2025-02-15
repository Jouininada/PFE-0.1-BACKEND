import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { LineItem } from '../interfaces/line-item.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InvoicingCalculationsService {
  constructor() {}
  //calulate subtotal for a line item
  calculateSubTotalForLineItem(lineItem: LineItem) {
    const { quantity, unit_price } = lineItem;
    return quantity * unit_price;
  }

  //calculate total for a line item
  calculateTotalForLineItem(lineItem: LineItem) {
    const { taxes, discount, discount_type } = lineItem;

    const subTotal = this.calculateSubTotalForLineItem(lineItem);

    const discountAmount =
      discount_type === DISCOUNT_TYPES.PERCENTAGE
        ? (subTotal * discount) / 100
        : discount;

    const subTotalPlusDiscount = subTotal - discountAmount;

    let regularTaxAmount = 0;
    let specialTaxAmount = 0;
    let fixedTaxAmount = 0;

    for (const tax of taxes) {
      if (tax?.isRate) {
        if (tax.isSpecial) specialTaxAmount += tax.value;
        else regularTaxAmount += tax.value;
      } else {
        fixedTaxAmount += tax.value;
      }
    }
    // Apply regular taxes first
    const totalAfterRegularTax =
      subTotalPlusDiscount * (1 + regularTaxAmount / 100);

    // Apply special taxes on top of the total after regular taxes
    const total =
      totalAfterRegularTax * (1 + specialTaxAmount / 100) + fixedTaxAmount;

    return total;
  }

  calculateTaxSummary(lineItems: LineItem[]) {
    const taxSummaryMap = new Map<number, { taxId: number; amount: number }>();

    lineItems.forEach((item) => {
      const taxes = item.taxes || [];
      const subTotalPlusDiscount = this.calculateSubTotalForLineItem(item) || 0;

      // Calculate regular taxes first
      let regularTaxAmount = 0;
      taxes.forEach((tax) => {
        if (!tax?.isSpecial && tax?.isRate) {
          // Handle percentage-based regular taxes (dividing rate by 100)
          const taxAmount = subTotalPlusDiscount * ((tax?.value || 0) / 100);
          regularTaxAmount += taxAmount;

          if (tax?.id && taxSummaryMap.has(tax.id)) {
            taxSummaryMap.get(tax.id)!.amount += taxAmount;
          } else {
            tax?.id &&
              taxSummaryMap.set(tax.id, { taxId: tax.id, amount: taxAmount });
          }
        } else if (!tax?.isSpecial && !tax?.isRate) {
          // Handle fixed-value regular taxes
          const taxAmount = tax?.value || 0;
          regularTaxAmount += taxAmount; // Include the fixed tax in the regular tax total

          if (tax?.id && taxSummaryMap.has(tax.id)) {
            taxSummaryMap.get(tax.id)!.amount += taxAmount;
          } else {
            tax?.id &&
              taxSummaryMap.set(tax.id, { taxId: tax.id, amount: taxAmount });
          }
        }
      });

      // Apply special taxes on top of the amount including regular taxes
      const totalAfterRegularTax = subTotalPlusDiscount + regularTaxAmount;
      taxes.forEach((tax) => {
        if (tax?.isSpecial && tax?.isRate) {
          // Handle percentage-based special taxes (dividing rate by 100)
          const taxAmount = totalAfterRegularTax * ((tax?.value || 0) / 100);
          if (tax?.id && taxSummaryMap.has(tax.id)) {
            taxSummaryMap.get(tax.id)!.amount += taxAmount;
          } else {
            tax?.id &&
              taxSummaryMap.set(tax.id, { taxId: tax.id, amount: taxAmount });
          }
        } else if (tax?.isSpecial && !tax?.isRate) {
          // Handle fixed-value special taxes
          const taxAmount = tax?.value || 0;
          if (tax?.id && taxSummaryMap.has(tax.id)) {
            taxSummaryMap.get(tax.id)!.amount += taxAmount;
          } else {
            tax?.id &&
              taxSummaryMap.set(tax.id, { taxId: tax.id, amount: taxAmount });
          }
        }
      });
    });

    return Array.from(taxSummaryMap.values());
  }

  //calculate subtotal and total for a line items after individual line items are calculated
  calculateLineItemsTotal(totals: number[], subTotals: number[]) {
    const subTotal = subTotals.reduce((total, current) => total + current, 0);
    const total = totals.reduce((total, current) => total + current, 0);
    return { subTotal, total };
  }

  calculateTotalDiscount(
    total: number,
    discount: number,
    discount_type: DISCOUNT_TYPES,
    taxStamp: number = 0,
    applyDiscountAfter: boolean = true,
  ): number {
    let discountAmount = 0;

    if (discount_type === DISCOUNT_TYPES.AMOUNT) {
      discountAmount = discount;
    } else {
      discountAmount = (total * discount) / 100;
    }

    if (applyDiscountAfter) {
      total -= discountAmount;
    } else {
      total -= discountAmount;
    }

    return total + taxStamp;
  }
}
