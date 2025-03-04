-- Table expense_payment
CREATE TABLE IF NOT EXISTS `expense_payment` (
    `id` int NOT NULL AUTO_INCREMENT,
    `amount` float DEFAULT NULL,
    `fee` float DEFAULT NULL,
    `convertionRate` float DEFAULT NULL,
    `date` datetime DEFAULT NULL,
    `mode` enum (
        'payment.payment_mode.cash',
        'payment.payment_mode.credit_card',
        'payment.payment_mode.check',
        'payment.payment_mode.bank_transfer',
        'payment.payment_mode.wire_transfer'
    ) DEFAULT NULL,
    `currencyId` int NOT NULL,
    `firmId` int NOT NULL,
    `notes` varchar(1024) DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT NOW(),
    `updatedAt` TIMESTAMP DEFAULT NOW(),
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`id`),
    KEY `FK_firm_expense_payment` (`firmId`),
    KEY `FK_currency_expense_payment` (`currencyId`),
    CONSTRAINT `FK_firm_expense_payment` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_currency_expense_payment` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE
);

-- Table expense_payment_upload
CREATE TABLE IF NOT EXISTS `expense_payment_upload` (
    `id` int NOT NULL AUTO_INCREMENT,
    `expensePaymentId` int DEFAULT NULL,
    `uploadId` int DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT NOW(),
    `updatedAt` TIMESTAMP DEFAULT NOW(),
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`id`),
    KEY `FK_expense_payment_expense_payment_upload` (`expensePaymentId`),
    KEY `FK_upload_expense_payment_upload` (`uploadId`),
    CONSTRAINT `FK_expense_payment_expense_payment_upload` FOREIGN KEY (`expensePaymentId`) REFERENCES `expense_payment` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_upload_expense_payment_upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
);

-- Table expense_payment_invoice_entry
CREATE TABLE IF NOT EXISTS `expense_payment_invoice_entry` (
    `id` int NOT NULL AUTO_INCREMENT,
    `expensePaymentId` int DEFAULT NULL,
    `expenseInvoiceId` int DEFAULT NULL,
    `amount` float DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT NOW(),
    `updatedAt` TIMESTAMP DEFAULT NOW(),
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`id`),
    KEY `FK_expense_payment_expense_payment_invoice_entry` (`expensePaymentId`),
    KEY `FK_expense_invoice_expense_payment_invoice_entry` (`expenseInvoiceId`),
    CONSTRAINT `FK_expense_payment_expense_payment_invoice_entry` FOREIGN KEY (`expensePaymentId`) REFERENCES `expense_payment` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_expense_invoice_expense_payment_invoice_entry` FOREIGN KEY (`expenseInvoiceId`) REFERENCES `expense_invoice` (`id`) ON DELETE CASCADE
);

-- Modifications pour la table expense_invoice
ALTER TABLE `expense_invoice`
ADD COLUMN `amountPaid` float DEFAULT 0;

ALTER TABLE `expense_invoice` MODIFY `status` ENUM (
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