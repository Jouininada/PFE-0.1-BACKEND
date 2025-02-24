-- Création de la table 'expense_payment'
CREATE TABLE IF NOT EXISTS `expense_payment` (
    `id` int NOT NULL AUTO_INCREMENT,
    `amount` float DEFAULT NULL,
    `fee` float DEFAULT NULL,
    `convertionRate` float DEFAULT NULL,
    `date` datetime DEFAULT NULL,
    `mode` enum(
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
    KEY `FK_firm_payment` (`firmId`),
    KEY `FK_currency_payment` (`currencyId`),
    CONSTRAINT `FK_firm_payment` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_currency_payment` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE
);

-- Création de la table 'expense_payment_upload'
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

-- Création de la table 'expense_payment_invoice_entry'
CREATE TABLE IF NOT EXISTS `expense_payment_invoice_entry` (
    `id` int NOT NULL AUTO_INCREMENT,
    `expensePaymentId` int DEFAULT NULL,
    `invoiceId` int DEFAULT NULL,
    `amount` float DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT NOW(),
    `updatedAt` TIMESTAMP DEFAULT NOW(),
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`id`),
    KEY `FK_expense_payment_expense_payment_invoice_entry` (`expensePaymentId`),
    KEY `FK_invoice_expense_payment_invoice_entry` (`invoiceId`),
    CONSTRAINT `FK_expense_payment_expense_payment_invoice_entry` FOREIGN KEY (`expensePaymentId`) REFERENCES `expense_payment` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_invoice_expense_payment_invoice_entry` FOREIGN KEY (`invoiceId`) REFERENCES `invoice` (`id`) ON DELETE CASCADE
);
