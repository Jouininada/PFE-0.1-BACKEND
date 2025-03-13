-- Table expense_payment
-- Table expense_payment
CREATE TABLE IF NOT EXISTS `expense_payment` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `amountPaid` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
    `fee` FLOAT DEFAULT NULL,
    `convertionRate` FLOAT DEFAULT NULL,
    `date` DATETIME DEFAULT NULL,
    `mode` ENUM(
        'payment.payment_mode.cash',
        'payment.payment_mode.credit_card',
        'payment.payment_mode.check',
        'payment.payment_mode.bank_transfer',
        'payment.payment_mode.wire_transfer'
    ) DEFAULT NULL,
    `currencyId` int DEFAULT NULL,
    `firmId` int DEFAULT NULL,
    `notes` varchar(1024) DEFAULT NULL,
    `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `deletedAt` timestamp NULL DEFAULT NULL,
    `isDeletionRestricted` tinyint(1) DEFAULT '0',
    `pdfFileId` int DEFAULT NULL,
    `sequentialNumbr` varchar(25) DEFAULT NULL,
    `sequential` varchar(25) DEFAULT NULL, -- Nouvelle colonne ajoutée
    PRIMARY KEY (`id`),
    KEY `FK_firm_expense_payment` (`firmId`),
    KEY `FK_currency_expense_payment` (`currencyId`),
    CONSTRAINT `FK_expense_payment_currency` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_expense_payment_firm` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS `expense_payment_upload` (
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


CREATE TABLE IF NOT EXISTS `expense_payment_invoice_entry` (
    `id` int NOT NULL AUTO_INCREMENT,
    `expensePaymentId` int DEFAULT NULL,
    `expenseInvoiceId` int DEFAULT NULL,
    `amount` float DEFAULT NULL,
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


-- Modifications pour la table expense_invoice
ALTER TABLE `expense_invoice`
ADD COLUMN `amountPaid` float DEFAULT 0;

ALTER TABLE `expense_invoice`
MODIFY COLUMN `status` ENUM (
ALTER TABLE `expense_invoice`
MODIFY COLUMN `status` ENUM (
    'invoice.status.non_existent',
    'invoice.status.draft',
    'invoice.status.sent',
    'invoice.status.validated',
    'invoice.status.paid',
    'invoice.status.partially_paid',
    'invoice.status.unpaid',
    'invoice.status.expired',
    'invoice.status.archived'
) DEFAULT NULL;