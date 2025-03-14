-- Migration 1 : Création des tables de base

-- Création de la table `expense_invoice_meta_data`
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
    `isDeletionRestricted` TINYINT(1) DEFAULT 0,
    `hasTaxWithholding` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`id`)
);

-- Création de la table `expense_invoice`
-- Création de la table `expense_invoice`
CREATE TABLE IF NOT EXISTS `expense_invoice` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `sequential` VARCHAR(25) DEFAULT NULL,
    `date` DATETIME DEFAULT NULL,
    `dueDate` DATETIME DEFAULT NULL,
    `object` VARCHAR(255) DEFAULT NULL,
    `generalConditions` VARCHAR(1024) DEFAULT NULL,
    `status` VARCHAR(255) DEFAULT NULL,
    `discount` FLOAT DEFAULT NULL,
    `discount_type` ENUM('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
    `subTotal` FLOAT DEFAULT NULL,
    `total` FLOAT DEFAULT NULL,
    `currencyId` INT NOT NULL,
    `firmId` INT NOT NULL,
    `interlocutorId` INT NOT NULL,
    `cabinetId` INT NOT NULL,
    `expenseInvoiceMetaDataId` INT NOT NULL,
    `notes` VARCHAR(1024) DEFAULT NULL,
    `bankAccountId` INT DEFAULT NULL,
    `amountPaid` FLOAT DEFAULT NULL,
    `taxWithholdingId` INT DEFAULT NULL,
    `taxWithholdingAmount` FLOAT DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` TINYINT(1) DEFAULT 0,
    `quotationId` INT DEFAULT NULL,
    `taxStampId` INT DEFAULT NULL,
    `sequentialNumbr` VARCHAR(25) DEFAULT NULL,
    `pdfFileId` INT DEFAULT NULL,
    `uploadPdfField` INT DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `sequential` (`sequential`),
    UNIQUE KEY `sequential` (`sequential`),
    KEY `FK_currency_expense_invoice` (`currencyId`),
    KEY `FK_firm_expense_invoice` (`firmId`),
    KEY `FK_interlocutor_expense_invoice` (`interlocutorId`),
    KEY `FK_cabinet_expense_invoice` (`cabinetId`),
    KEY `FK_expense_invoice_meta_data` (`expenseInvoiceMetaDataId`),
    KEY `FK_expense_invoice_tax_withholding` (`taxWithholdingId`),
    KEY `FK_bank_account_expense_invoice` (`bankAccountId`),
    KEY `FK_expense_invoice_expense_quotation` (`quotationId`),
    KEY `FK_expense_invoice_tax` (`taxStampId`),
    KEY `fk_expense_invoice_pdf` (`pdfFileId`),
    CONSTRAINT `FK_bank_account_expense_invoice` FOREIGN KEY (`bankAccountId`) REFERENCES `bank_account` (`id`) ON DELETE SET NULL,
    CONSTRAINT `FK_cabinet_expense_invoice` FOREIGN KEY (`cabinetId`) REFERENCES `cabinet` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_currency_expense_invoice` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_expense_invoice_expense_quotation` FOREIGN KEY (`quotationId`) REFERENCES `expense_quotation` (`id`) ON DELETE SET NULL,
    CONSTRAINT `FK_expense_invoice_meta_data` FOREIGN KEY (`expenseInvoiceMetaDataId`) REFERENCES `expense_invoice_meta_data` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_expense_invoice_pdf` FOREIGN KEY (`pdfFileId`) REFERENCES `upload` (`id`) ON DELETE SET NULL,
    CONSTRAINT `FK_expense_invoice_tax` FOREIGN KEY (`taxStampId`) REFERENCES `tax` (`id`) ON DELETE SET NULL,
    CONSTRAINT `FK_expense_invoice_tax_withholding` FOREIGN KEY (`taxWithholdingId`) REFERENCES `tax_withholding` (`id`) ON DELETE SET NULL,
    CONSTRAINT `FK_firm_expense_invoice` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_interlocutor_expense_invoice` FOREIGN KEY (`interlocutorId`) REFERENCES `interlocutor` (`id`) ON DELETE CASCADE
);

-- Création de la table `article_expense_invoice_entry`
CREATE TABLE IF NOT EXISTS `article_expense_invoice_entry` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `unit_price` FLOAT DEFAULT NULL,
    `quantity` FLOAT DEFAULT NULL,
    `discount` FLOAT DEFAULT NULL,
    `discount_type` ENUM('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
    `subTotal` FLOAT DEFAULT NULL,
    `total` FLOAT DEFAULT NULL,
    `articleId` INT DEFAULT NULL,
    `expenseInvoiceId` INT DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` TINYINT(1) DEFAULT 0,
    `isDeletionRestricted` TINYINT(1) DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `FK_article_article_expense_invoice_entry` (`articleId`),
    KEY `FK_expense_invoice_article_expense_invoice_entry` (`expenseInvoiceId`),
    CONSTRAINT `FK_article_article_expense_invoice_entry` FOREIGN KEY (`articleId`) REFERENCES `article` (`id`) ON DELETE SET NULL,
    CONSTRAINT `FK_expense_invoice_article_expense_invoice_entry` FOREIGN KEY (`expenseInvoiceId`) REFERENCES `expense_invoice` (`id`) ON DELETE SET NULL
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
-- Création de la table `article_expense_invoice_entry_tax`
CREATE TABLE IF NOT EXISTS `article_expense_invoice_entry_tax` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `articleExpenseInvoiceEntryId` INT NOT NULL,
    `taxId` INT NOT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` TINYINT(1) DEFAULT 0,
    `isDeletionRestricted` TINYINT(1) DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `FK_articleExpenseInvoiceEntry_article_expense_invoice_entry_tax` (`articleExpenseInvoiceEntryId`),
    KEY `FK_tax_article_expense_invoice_entry_tax` (`taxId`),
    CONSTRAINT `FK_articleExpenseInvoiceEntry_article_expense_invoice_entry_tax` FOREIGN KEY (`articleExpenseInvoiceEntryId`) REFERENCES `article_expense_invoice_entry` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_tax_article_expense_invoice_entry_tax` FOREIGN KEY (`taxId`) REFERENCES `tax` (`id`) ON DELETE CASCADE
    KEY `FK_articleExpenseInvoiceEntry_article_expense_invoice_entry_tax` (`articleExpenseInvoiceEntryId`),
    KEY `FK_tax_article_expense_invoice_entry_tax` (`taxId`),
    CONSTRAINT `FK_articleExpenseInvoiceEntry_article_expense_invoice_entry_tax` FOREIGN KEY (`articleExpenseInvoiceEntryId`) REFERENCES `article_expense_invoice_entry` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_tax_article_expense_invoice_entry_tax` FOREIGN KEY (`taxId`) REFERENCES `tax` (`id`) ON DELETE CASCADE
);

-- Création de la table `expense_invoice_upload`
-- Création de la table `expense_invoice_upload`
CREATE TABLE IF NOT EXISTS `expense_invoice_upload` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `expenseInvoiceId` INT DEFAULT NULL,
    `uploadId` INT DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `id` INT NOT NULL AUTO_INCREMENT,
    `expenseInvoiceId` INT DEFAULT NULL,
    `uploadId` INT DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` TINYINT(1) DEFAULT 0,
    `isDeletionRestricted` TINYINT(1) DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `FK_expense_invoice_expense_invoice_upload` (`expenseInvoiceId`),
    KEY `FK_upload_expense_invoice_upload` (`uploadId`),
    CONSTRAINT `FK_expense_invoice_expense_invoice_upload` FOREIGN KEY (`expenseInvoiceId`) REFERENCES `expense_invoice` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_upload_expense_invoice_upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
);