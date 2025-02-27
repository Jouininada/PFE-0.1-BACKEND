
CREATE TABLE `expense_payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amountPaid` decimal(10,2) NOT NULL DEFAULT '0.00',
  `fee` float DEFAULT NULL,
  `convertionRate` float DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `mode` enum('payment.payment_mode.cash','payment.payment_mode.credit_card','payment.payment_mode.check','payment.payment_mode.bank_transfer','payment.payment_mode.wire_transfer') DEFAULT NULL,
  `currencyId` int NOT NULL,
  `firmId` int NOT NULL,
  `notes` varchar(1024) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  `isDeletionRestricted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_firm_payment` (`firmId`),
  KEY `FK_currency_payment` (`currencyId`),
  CONSTRAINT `FK_currency_payment` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_firm_payment` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE
) ;

CREATE TABLE `expense_payment_upload` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expensePaymentId` int DEFAULT NULL,
  `uploadId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  `isDeletionRestricted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_expense_payment_expense_payment_upload` (`expensePaymentId`),
  KEY `FK_upload_expense_payment_upload` (`uploadId`),
  CONSTRAINT `FK_expense_payment_expense_payment_upload` FOREIGN KEY (`expensePaymentId`) REFERENCES `expense_payment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_upload_expense_payment_upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
) ;


CREATE TABLE `expense_payment_invoice_entry` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paymentId` int DEFAULT NULL,
  `expenseInvoiceId` int DEFAULT NULL,
  `amountPaid` float DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  `isDeletionRestricted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_expense_payment_expense_payment_invoice_entry` (`paymentId`),
  KEY `FK_expense_invoice_expense_payment_invoice_entry` (`expenseInvoiceId`),
  CONSTRAINT `FK_expense_invoice_expense_payment_invoice_entry` FOREIGN KEY (`expenseInvoiceId`) REFERENCES `expense_invoice` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_expense_payment_expense_payment_invoice_entry` FOREIGN KEY (`paymentId`) REFERENCES `expense_payment` (`id`) ON DELETE CASCADE
);