export enum EVENT_TYPE {
  //Auth
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_ACTIVATED = 'user_activated',
  USER_DEACTIVATED = 'user_deactivated',

  //Role
  ROLE_CREATED = 'role_created',
  ROLE_UPDATED = 'role_updated',
  ROLE_DELETED = 'role_deleted',
  ROLE_DUPLICATED = 'role_duplicated',

  //Firm
  FIRM_CREATED = 'firm_created',
  FIRM_UPDATED = 'firm_updated',
  FIRM_DELETED = 'firm_deleted',

  //interlocutor
  INTERLOCUTOR_CREATED = 'interlocutor_created',
  INTERLOCUTOR_UPDATED = 'interlocutor_updated',
  INTERLOCUTOR_DELETED = 'interlocutor_deleted',
  INTERLOCUTOR_PROMOTED = 'interlocutor_promoted',

  //Selling Quotation
  SELLING_QUOTATION_CREATED = 'quotation_created',
  SELLING_QUOTATION_UPDATED = 'quotation_updated',
  SELLING_QUOTATION_DELETED = 'quotation_deleted',
  SELLING_QUOTATION_PRINTED = 'quotation_printed',
  SELLING_QUOTATION_INVOICED = 'quotation_invoiced',
  SELLING_QUOTATION_DUPLICATED = 'quotation_duplicated',

  //Selling Invoice
  SELLING_INVOICE_CREATED = 'invoice_created',
  SELLING_INVOICE_UPDATED = 'invoice_updated',
  SELLING_INVOICE_DELETED = 'invoice_deleted',
  SELLING_INVOICE_PRINTED = 'invoice_printed',
  SELLING_INVOICE_DUPLICATED = 'invoice_duplicated',

  //Selling Payment
  SELLING_PAYMENT_CREATED = 'payment_created',
  SELLING_PAYMENT_UPDATED = 'payment_updated',
  SELLING_PAYMENT_DELETED = 'payment_deleted',

  //Content
  ACTIVITY_CREATED = 'activity_created',
  ACTIVITY_UPDATED = 'activity_updated',
  ACTIVITY_DELETED = 'activity_deleted',

  BANK_ACCOUNT_CREATED = 'bank_account_created',
  BANK_ACCOUNT_UPDATED = 'bank_account_updated',
  BANK_ACCOUNT_DELETED = 'bank_account_deleted',

  DEFAULT_CONDITION_CREATED = 'default_condition_created',
  DEFAULT_CONDITION_UPDATED = 'default_condition_updated',
  DEFAULT_CONDITION_MASS_UPDATED = 'default_conditions_updated',
  DEFAULT_CONDITION_DELETED = 'default_condition_deleted',

  PAYMENT_CONDITION_CREATED = 'payment_condition_created',
  PAYMENT_CONDITION_UPDATED = 'payment_condition_updated',
  PAYMENT_CONDITION_DELETED = 'payment_condition_deleted',

  TAX_WITHHOLDING_CREATED = 'tax_withholding_created',
  TAX_WITHHOLDING_UPDATED = 'tax_withholding_updated',
  TAX_WITHHOLDING_DELETED = 'tax_withholding_deleted',

  TAX_CREATED = 'tax_created',
  TAX_UPDATED = 'tax_updated',
  TAX_DELETED = 'tax_deleted',
}
