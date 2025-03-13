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
    `currencyId` INT NOT NULL,
    `firmId` INT NOT NULL,
    `notes` VARCHAR(1024) DEFAULT NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` TIMESTAMP NULL DEFAULT NULL,
    `isDeletionRestricted` TINYINT(1) DEFAULT '0',
    PRIMARY KEY (`id`),
    KEY `FK_firm_payment` (`firmId`),
    KEY `FK_currency_payment` (`currencyId`),
    CONSTRAINT `FK_firm_payment` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_currency_payment` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS `expense_payment_upload` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `expensePaymentId` INT DEFAULT NULL,
    `uploadId` INT DEFAULT NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` TIMESTAMP NULL DEFAULT NULL,
    `isDeletionRestricted` TINYINT(1) DEFAULT '0',
    PRIMARY KEY (`id`),
    KEY `FK_expense_payment_expense_payment_upload` (`expensePaymentId`),
    KEY `FK_upload_expense_payment_upload` (`uploadId`),
    CONSTRAINT `FK_expense_payment_expense_payment_upload` FOREIGN KEY (`expensePaymentId`) REFERENCES `expense_payment` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_upload_expense_payment_upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
) ;


CREATE TABLE IF NOT EXISTS `expense_payment_invoice_entry` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `paymentId` INT DEFAULT NULL,
    `expenseInvoiceId` INT DEFAULT NULL,
    `amountPaid` FLOAT DEFAULT NULL,
    `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` TIMESTAMP NULL DEFAULT NULL,
    `isDeletionRestricted` TINYINT(1) DEFAULT '0',
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