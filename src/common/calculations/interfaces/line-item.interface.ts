import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';

export interface Tax {
  id: number;
  value: number;
  isRate: boolean;
  isSpecial: boolean;
}

export interface LineItem {
  quantity: number;
  unit_price: number;
  discount: number;
  discount_type: DISCOUNT_TYPES;
  taxes: Tax[];
}
