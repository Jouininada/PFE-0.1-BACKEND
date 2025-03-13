import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/common/app-config/app-config.module';
import { AppConfigController } from 'src/common/app-config/controllers/app-config.controller';
import { AuthModule } from 'src/common/auth/auth.module';
import { AuthController } from 'src/common/auth/controllers/auth.controller';
import { LoggerModule } from 'src/common/logger/logger.module';
import { StorageController } from 'src/common/storage/controllers/storage.controller';
import { StorageModule } from 'src/common/storage/storage.module';
import { ActivityModule } from 'src/modules/activity/activity.module';
import { ActivityController } from 'src/modules/activity/controllers/activity.controller';
import { AddressModule } from 'src/modules/address/address.module';
import { AddressController } from 'src/modules/address/controllers/address.controller';
import { ArticleHistoryModule } from 'src/modules/article-history/article-history.module';
import { ArticleHistoryController } from 'src/modules/article-history/controllers/article-history.controller';
import { ArticleModule } from 'src/modules/article/article.module';
import { ArticleController } from 'src/modules/article/controllers/article.controller';
import { BankAccountModule } from 'src/modules/bank-account/bank-account.module';
import { BankAccountController } from 'src/modules/bank-account/controllers/bank-account.controller';
import { CabinetModule } from 'src/modules/cabinet/cabinet.module';
import { CabinetController } from 'src/modules/cabinet/controllers/cabinet.controller';
import { CountryController } from 'src/modules/country/controllers/country.controller';
import { CountryModule } from 'src/modules/country/country.module';
import { CurrencyController } from 'src/modules/currency/controllers/currency.controller';
import { CurrencyModule } from 'src/modules/currency/currency.module';
import { DefaultConditionController } from 'src/modules/default-condition/controllers/default-condition.controller';
import { DefaultConditionModule } from 'src/modules/default-condition/default-condition.module';
import { ExpenseInvoiceController } from 'src/modules/expense-invoice/controllers/expense-invoice.controller';
import { ExpenseInvoiceModule } from 'src/modules/expense-invoice/expense-invoice.module';
import { ExpensePaymentConditionController } from 'src/modules/expense-payment-condition/controllers/expense-payment-condition.controller';
import { ExpensePaymentConditionModule } from 'src/modules/expense-payment-condition/payment-condition.module';
import { ExpensePaymentController } from 'src/modules/expense-payment/controllers/expense-payment.controller';
import { ExpensePaymentModule } from 'src/modules/expense-payment/expense-payment.module';
import { ExpensQuotationController } from 'src/modules/expense_quotation/controllers/expensquotation.controller';
import { ExpenseQuotationModule } from 'src/modules/expense_quotation/expensquotation.module';
import { FirmInterlocutorEntryController } from 'src/modules/firm-interlocutor-entry/controllers/firm-interlocutor-entry.controller.ts';
import { FirmInterlocutorEntryModule } from 'src/modules/firm-interlocutor-entry/firm-interlocutor-entry.module';
import { FirmController } from 'src/modules/firm/controllers/firm.controller';
import { FirmModule } from 'src/modules/firm/firm.module';
import { InterlocutorModule } from 'src/modules/interlocutor/Interlocutor.module';
import { InterlocutorController } from 'src/modules/interlocutor/controllers/interlocutor.controller';
import { InvoiceController } from 'src/modules/invoice/controllers/invoice.controller';
import { InvoiceModule } from 'src/modules/invoice/invoice.module';
import { PaymentConditionController } from 'src/modules/payment-condition/controllers/payment-condition.controller';
import { PaymentConditionModule } from 'src/modules/payment-condition/payment-condition.module';
import { PaymentController } from 'src/modules/payment/controllers/payment.controller';
import { PaymentModule } from 'src/modules/payment/payment.module';
import { PermissionController } from 'src/modules/permission/controllers/permission.controller';
import { PermissionModule } from 'src/modules/permission/permission.module';
import { QuotationController } from 'src/modules/quotation/controllers/quotation.controller';
import { QuotationModule } from 'src/modules/quotation/quotation.module';
import { RoleController } from 'src/modules/role/controllers/role.controller';
import { RoleModule } from 'src/modules/role/role.module';
import { TaxWithholdingController } from 'src/modules/tax-withholding/controllers/tax-withholding.controller';
import { TaxWithholdingModule } from 'src/modules/tax-withholding/tax-withholding.module';
import { TaxController } from 'src/modules/tax/controllers/tax.controller';
import { TaxModule } from 'src/modules/tax/tax.module';
import { UserController } from 'src/modules/user/controllers/user.controller';
import { UsersModule } from 'src/modules/user/user.module';

@Module({
  controllers: [
    AuthController,
    ActivityController,
    AddressController,
    ArticleController,
    AppConfigController,
    BankAccountController,
    CabinetController,
    CountryController,
    CurrencyController,
    DefaultConditionController,
    FirmController,
    FirmInterlocutorEntryController,
    InterlocutorController,
    InvoiceController,
    PaymentController,
    PaymentConditionController,
    PermissionController,
    QuotationController,
    RoleController,
    StorageController,
    TaxController,
    TaxWithholdingController,
    UserController,
    ExpensQuotationController,
    ExpenseInvoiceController,
    ExpensePaymentController,
    ExpensePaymentConditionController,
    ArticleHistoryController



  ],
  providers: [],
  exports: [],
  imports: [
    LoggerModule,
    AuthModule,
    ActivityModule,
    AddressModule,
    ArticleModule,
    AppConfigModule,
    BankAccountModule,
    CabinetModule,
    CountryModule,
    CurrencyModule,
    DefaultConditionModule,
    FirmModule,
    FirmInterlocutorEntryModule,
    InterlocutorModule,
    InvoiceModule,
    PaymentConditionModule,
    PaymentModule,
    PermissionModule,
    QuotationModule,
    RoleModule,
    StorageModule,
    TaxModule,
    TaxWithholdingModule,
    UsersModule,
    ExpenseQuotationModule,
    ExpenseInvoiceModule,
    ExpensePaymentModule,
    ExpensePaymentConditionModule,
    ArticleHistoryModule



  ],
})
export class RoutesPublicModule {}
