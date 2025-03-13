-- Migration 1 : Création des tables de base

-- Création de la table `expense_invoice_meta_data`
CREATE TABLE IF NOT EXISTS `expense_invoice_meta_data` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `showInvoiceAddress` BOOLEAN DEFAULT TRUE,
    `showDeliveryAddress` BOOLEAN DEFAULT TRUE,
    `showArticleDescription` BOOLEAN DEFAULT TRUE,
    `hasBankingDetails` BOOLEAN DEFAULT TRUE,
    `hasGeneralConditions` BOOLEAN DEFAULT TRUE,
    `taxSummary` JSON DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` TINYINT(1) DEFAULT 0,
    `hasTaxWithholding` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`id`)
);

-- Création de la table `expense_invoice`
CREATE TABLE IF NOT EXISTS `expense_invoice` (
    `id` int NOT NULL AUTO_INCREMENT,
    `sequential` varchar(25) DEFAULT NULL,
    `date` datetime DEFAULT NULL,
    `dueDate` datetime DEFAULT NULL,
    `object` varchar(255) DEFAULT NULL,
    `generalConditions` varchar(1024) DEFAULT NULL,
    `status` varchar(255) DEFAULT NULL,
    `discount` float DEFAULT NULL,
    `discount_type` enum('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
    `subTotal` float DEFAULT NULL,
    `total` float DEFAULT NULL,
    `currencyId` int NOT NULL,
    `firmId` int NOT NULL,
    `interlocutorId` int NOT NULL,
    `cabinetId` int NOT NULL,
    `expenseInvoiceMetaDataId` int NOT NULL,
    `notes` varchar(1024) DEFAULT NULL,
    `bankAccountId` int DEFAULT NULL,
    `amountPaid` float DEFAULT NULL,
    `taxWithholdingId` int DEFAULT NULL,
    `taxWithholdingAmount` float DEFAULT NULL,
    `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `deletedAt` timestamp NULL DEFAULT NULL,
    `isDeletionRestricted` tinyint(1) DEFAULT '0',
    `sequentialNumbr` varchar(25) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `sequential` (`sequential`),
    KEY `FK_currency_expense_invoice` (`currencyId`),
    KEY `FK_firm_expense_invoice` (`firmId`),
    KEY `FK_interlocutor_expense_invoice` (`interlocutorId`),
    KEY `FK_cabinet_expense_invoice` (`cabinetId`),
    KEY `FK_expense_invoice_meta_data` (`expenseInvoiceMetaDataId`),
    KEY `FK_expense_invoice_tax_withholding` (`taxWithholdingId`),
    KEY `FK_bank_account_expense_invoice` (`bankAccountId`),
    CONSTRAINT `FK_bank_account_expense_invoice` FOREIGN KEY (`bankAccountId`) REFERENCES `bank_account` (`id`) ON DELETE SET NULL,
    CONSTRAINT `FK_cabinet_expense_invoice` FOREIGN KEY (`cabinetId`) REFERENCES `cabinet` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_currency_expense_invoice` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_expense_invoice_meta_data` FOREIGN KEY (`expenseInvoiceMetaDataId`) REFERENCES `expense_invoice_meta_data` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_expense_invoice_tax_withholding` FOREIGN KEY (`taxWithholdingId`) REFERENCES `tax-withholding` (`id`) ON DELETE SET NULL,
    CONSTRAINT `FK_firm_expense_invoice` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_interlocutor_expense_invoice` FOREIGN KEY (`interlocutorId`) REFERENCES `interlocutor` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `article-expense-invoice-entry` (
    `id` int NOT NULL AUTO_INCREMENT,
    `unit_price` float DEFAULT NULL,
    `quantity` float DEFAULT NULL,
    `discount` float DEFAULT NULL,
    `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
    `subTotal` float DEFAULT NULL,
    `total` float DEFAULT NULL,
    `articleId` int DEFAULT NULL,
    `expenseInvoiceId` int DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT NOW(),
    `updatedAt` TIMESTAMP DEFAULT NOW(),
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` TINYINT(1) DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `FK_article_article_expense_invoice_entry` (`articleId`),
    KEY `FK_expense_invoice_article_expense_invoice_entry` (`expenseInvoiceId`),
    CONSTRAINT `FK_article_article_expense_invoice_entry` FOREIGN KEY (`articleId`) REFERENCES `article` (`id`) ON DELETE SET NULL,
    CONSTRAINT `FK_expense_invoice_article_expense_invoice_entry` FOREIGN KEY (`expenseInvoiceId`) REFERENCES `expense_invoice` (`id`) ON DELETE SET NULL
);

-- Création de la table `article_expense_invoice_entry_tax`
CREATE TABLE IF NOT EXISTS `article_expense_invoice_entry_tax` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `articleExpenseInvoiceEntryId` INT NOT NULL,
    `taxId` INT NOT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` TINYINT(1) DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `FK_articleExpenseInvoiceEntry_article_expense_invoice_entry_tax` (`articleExpenseInvoiceEntryId`),
    KEY `FK_tax_article_expense_invoice_entry_tax` (`taxId`),
    CONSTRAINT `FK_articleExpenseInvoiceEntry_article_expense_invoice_entry_tax` FOREIGN KEY (`articleExpenseInvoiceEntryId`) REFERENCES `article_expense_invoice_entry` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_tax_article_expense_invoice_entry_tax` FOREIGN KEY (`taxId`) REFERENCES `tax` (`id`) ON DELETE CASCADE
);

-- Création de la table `expense_invoice_upload`
CREATE TABLE IF NOT EXISTS `expense_invoice_upload` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `expenseInvoiceId` INT DEFAULT NULL,
    `uploadId` INT DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` TINYINT(1) DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `FK_expense_invoice_expense_invoice_upload` (`expenseInvoiceId`),
    KEY `FK_upload_expense_invoice_upload` (`uploadId`),
    CONSTRAINT `FK_expense_invoice_expense_invoice_upload` FOREIGN KEY (`expenseInvoiceId`) REFERENCES `expense_invoice` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_upload_expense_invoice_upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
);