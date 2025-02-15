-- Création de la table expense_quotation_meta_data
CREATE TABLE IF NOT EXISTS `expense_quotation_meta_data` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `showInvoiceAddress` BOOLEAN DEFAULT TRUE,
    `showDeliveryAddress` BOOLEAN DEFAULT TRUE,
    `showArticleDescription` BOOLEAN DEFAULT TRUE,
    `hasBankingDetails` BOOLEAN DEFAULT TRUE,
    `hasGeneralConditions` BOOLEAN DEFAULT TRUE,
    `hasTaxStamp` BOOLEAN DEFAULT TRUE,
    `taxSummary` JSON DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT NOW(),
    `updatedAt` TIMESTAMP DEFAULT NOW(),
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`id`)
);

-- Modification de la table expense_quotation pour ajouter bankAccountId
CREATE TABLE IF NOT EXISTS `expense_quotation` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `sequential` VARCHAR(25) NOT NULL UNIQUE,
    `date` DATETIME DEFAULT NULL,
    `dueDate` DATETIME DEFAULT NULL,
    `object` VARCHAR(255) DEFAULT NULL,
    `generalConditions` VARCHAR(1024) DEFAULT NULL,
    `status` ENUM(
        'quotation.status.non_existent',
        'quotation.status.expired',
        'quotation.status.draft',
        'quotation.status.validated',
        'quotation.status.sent',
        'quotation.status.accepted',
        'quotation.status.rejected'
    ) DEFAULT NULL,
    `discount` FLOAT DEFAULT NULL,
    `discount_type` ENUM('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
    `subTotal` FLOAT DEFAULT NULL,
    `total` FLOAT DEFAULT NULL,
    `currencyId` INT NOT NULL,
    `firmId` INT NOT NULL,
    `interlocutorId` INT NOT NULL,
    `cabinetId` INT NOT NULL,
    `expenseMetaDataId` INT NOT NULL,
    `bankAccountId` INT DEFAULT NULL, -- Ajout de la colonne bankAccountId
    `notes` VARCHAR(1024) DEFAULT NULL,
    `taxStamp` FLOAT DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT NOW(),
    `updatedAt` TIMESTAMP DEFAULT NOW(),
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`id`),
    KEY `FK_currency_expense_quotation` (`currencyId`),
    KEY `FK_firm_expense_quotation` (`firmId`),
    KEY `FK_interlocutor_expense_quotation` (`interlocutorId`),
    KEY `FK_cabinet_expense_quotation` (`cabinetId`),
    KEY `FK_expense_meta_data_quotation` (`expenseMetaDataId`),
    KEY `FK_bank_account_expense_quotation` (`bankAccountId`), -- Ajout de l'index pour la clé étrangère
    CONSTRAINT `FK_currency_expense_quotation` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_firm_expense_quotation` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_interlocutor_expense_quotation` FOREIGN KEY (`interlocutorId`) REFERENCES `interlocutor` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_cabinet_expense_quotation` FOREIGN KEY (`cabinetId`) REFERENCES `cabinet` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_expense_meta_data_quotation` FOREIGN KEY (`expenseMetaDataId`) REFERENCES `expense_quotation_meta_data` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_bank_account_expense_quotation` FOREIGN KEY (`bankAccountId`) REFERENCES `bank_account` (`id`) ON DELETE SET NULL
);


-- Création de la table expense_article_quotation_entry
CREATE TABLE IF NOT EXISTS `expense_article_quotation_entry` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `unit_price` FLOAT DEFAULT NULL,
    `quantity` FLOAT DEFAULT NULL,
    `discount` FLOAT DEFAULT NULL,
    `discount_type` ENUM('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
    `subTotal` FLOAT DEFAULT NULL,
    `total` FLOAT DEFAULT NULL,
    `articleId` INT DEFAULT NULL,
    `expenseQuotationId` INT DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT NOW(),
    `updatedAt` TIMESTAMP DEFAULT NOW(),
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`id`),
    KEY `FK_article_expense_article_entry` (`articleId`),
    KEY `FK_expense_quotation_article_entry` (`expenseQuotationId`),
    CONSTRAINT `FK_article_expense_article_entry` FOREIGN KEY (`articleId`) REFERENCES `article` (`id`) ON DELETE SET NULL,
    CONSTRAINT `FK_expense_quotation_article_entry` FOREIGN KEY (`expenseQuotationId`) REFERENCES `expense_quotation` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `expense_article_quotation_entry_tax` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `expenseArticleEntryId` INT NOT NULL,
    `taxId` INT NOT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`id`),
    KEY `FK_expense_article_entry_tax` (`expenseArticleEntryId`),
    KEY `FK_tax_expense_article_entry_tax` (`taxId`),
    CONSTRAINT `FK_expense_article_entry_tax` FOREIGN KEY (`expenseArticleEntryId`) REFERENCES `expense_article_quotation_entry` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_tax_expense_article_entry_tax` FOREIGN KEY (`taxId`) REFERENCES `tax` (`id`) ON DELETE CASCADE
);

-- Création de la table expense_quotation_upload
CREATE TABLE IF NOT EXISTS `expense_quotation_upload` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `expensequotationId` INT DEFAULT NULL,
    `uploadId` INT DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT NOW(),
    `updatedAt` TIMESTAMP DEFAULT NOW(),
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`id`),
    KEY `FK_quotation_expense_quotation_upload` (`expensequotationId`),
    KEY `FK_upload_expense_quotation_upload` (`uploadId`),
    CONSTRAINT `FK_quotation_expense_quotation_upload` FOREIGN KEY (`expensequotationId`) REFERENCES `expense_quotation` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_upload_expense_quotation_upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
);
