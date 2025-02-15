CREATE TABLE
    IF NOT EXISTS `invoice_meta_data` (
        `id` int NOT NULL AUTO_INCREMENT,
        `showInvoiceAddress` boolean DEFAULT TRUE,
        `showDeliveryAddress` boolean DEFAULT TRUE,
        `showArticleDescription` boolean DEFAULT TRUE,
        `hasBankingDetails` boolean DEFAULT TRUE,
        `hasGeneralConditions` boolean DEFAULT TRUE,
        `taxSummary` json DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `invoice` (
        `id` int NOT NULL AUTO_INCREMENT,
        `sequential` varchar(25) NOT NULL UNIQUE,
        `date` datetime DEFAULT NULL,
        `dueDate` datetime DEFAULT NULL,
        `object` varchar(255) DEFAULT NULL,
        `generalConditions` varchar(1024) DEFAULT NULL,
        `status` enum (
            'invoice.status.non_existent',
            'invoice.status.draft',
            'invoice.status.sent',
            'invoice.status.validated',
            'invoice.status.paid',
            'invoice.status.unpaid',
            'invoice.status.expired',
            'invoice.status.archived'
        ) DEFAULT NULL,
        `discount` float DEFAULT NULL,
        `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
        `subTotal` float DEFAULT NULL,
        `total` float DEFAULT NULL,
        `currencyId` int NOT NULL,
        `firmId` int NOT NULL,
        `interlocutorId` int NOT NULL,
        `cabinetId` int NOT NULL,
        `invoiceMetaDataId` int NOT NULL,
        `notes` varchar(1024) DEFAULT NULL,
        `bankAccountId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_currency_invoice` (`currencyId`),
        KEY `FK_firm_invoice` (`firmId`),
        KEY `FK_interlocutor_invoice` (`interlocutorId`),
        KEY `FK_cabinet_invoice` (`cabinetId`),
        KEY `FK_invoice_meta_data_invoice` (`invoiceMetaDataId`),
        CONSTRAINT `FK_currency_invoice` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_firm_invoice` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_interlocutor_invoice` FOREIGN KEY (`interlocutorId`) REFERENCES `interlocutor` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_cabinet_invoice` FOREIGN KEY (`cabinetId`) REFERENCES `cabinet` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_bank_account_invoice` FOREIGN KEY (`bankAccountId`) REFERENCES `bank_account` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_invoice_meta_data_invoice` FOREIGN KEY (`invoiceMetaDataId`) REFERENCES `invoice_meta_data` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `article-invoice-entry` (
        `id` int NOT NULL AUTO_INCREMENT,
        `unit_price` float DEFAULT NULL,
        `quantity` float DEFAULT NULL,
        `discount` float DEFAULT NULL,
        `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
        `subTotal` float DEFAULT NULL,
        `total` float DEFAULT NULL,
        `articleId` int DEFAULT NULL,
        `invoiceId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_article_article-invoice-entry` (`articleId`),
        KEY `FK_invoice_article-invoice-entry` (`invoiceId`),
        CONSTRAINT `FK_article_article-invoice-entry` FOREIGN KEY (`articleId`) REFERENCES `article` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_invoice_article-invoice-entry` FOREIGN KEY (`invoiceId`) REFERENCES `invoice` (`id`) ON DELETE SET NULL
    );

CREATE TABLE
    IF NOT EXISTS `article-invoice-entry-tax` (
        `id` int NOT NULL AUTO_INCREMENT,
        `articleInvoiceEntryId` int NOT NULL,
        `taxId` int NOT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_articleInvoiceEntry_article-invoice-entry-tax` (`articleInvoiceEntryId`),
        KEY `FK_tax_article-invoice-entry-tax` (`taxId`),
        CONSTRAINT `FK_articleInvoiceEntry_article-invoice-entry-tax` FOREIGN KEY (`articleInvoiceEntryId`) REFERENCES `article-invoice-entry` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_tax_article-invoice-entry-tax` FOREIGN KEY (`taxId`) REFERENCES `tax` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `invoice-upload` (
        `id` int NOT NULL AUTO_INCREMENT,
        `invoiceId` int DEFAULT NULL,
        `uploadId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_invoice_invoice-upload` (`invoiceId`),
        KEY `FK_upload_invoice-upload` (`uploadId`),
        CONSTRAINT `FK_invoice_invoice-upload` FOREIGN KEY (`invoiceId`) REFERENCES `invoice` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_upload_invoice-upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
    );