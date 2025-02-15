CREATE TABLE
    IF NOT EXISTS `app_config` (
        `id` int NOT NULL AUTO_INCREMENT,
        `key` varchar(255) NOT NULL UNIQUE,
        `value` json DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `activity` (
        `id` int NOT NULL AUTO_INCREMENT,
        `label` varchar(255) DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `country` (
        `id` int NOT NULL,
        `alpha2code` varchar(2) DEFAULT NULL,
        `alpha3code` varchar(3) DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `address` (
        `id` int NOT NULL AUTO_INCREMENT,
        `address` varchar(255) DEFAULT NULL,
        `address2` varchar(255) DEFAULT NULL,
        `region` varchar(255) DEFAULT NULL,
        `zipcode` varchar(10) DEFAULT NULL,
        `countryId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_country_address` (`countryId`),
        CONSTRAINT `FK_countryId` FOREIGN KEY (`countryId`) REFERENCES `country` (`id`) ON DELETE SET NULL
    );

CREATE TABLE
    IF NOT EXISTS `article` (
        `id` int NOT NULL AUTO_INCREMENT,
        `title` varchar(50) DEFAULT NULL,
        `description` varchar(255) DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `currency` (
        `id` int NOT NULL,
        `label` varchar(255) DEFAULT NULL,
        `code` varchar(3) DEFAULT NULL,
        `symbol` varchar(10) DEFAULT NULL,
        `digitAfterComma` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `cabinet` (
        `id` int NOT NULL AUTO_INCREMENT,
        `enterpriseName` varchar(255) DEFAULT NULL UNIQUE,
        `email` varchar(255) DEFAULT NULL,
        `phone` varchar(50) DEFAULT NULL,
        `taxIdNumber` varchar(50) DEFAULT NULL UNIQUE,
        `activityId` int DEFAULT NULL,
        `currencyId` int DEFAULT NULL,
        `addressId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_activity_cabinet` (`activityId`),
        KEY `FK_currency_cabinet` (`currencyId`),
        KEY `FK_addressId_cabinet` (`addressId`),
        CONSTRAINT `FK_activity_cabinet` FOREIGN KEY (`activityId`) REFERENCES `activity` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_currency_cabinet` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_address_cabinet` FOREIGN KEY (`addressId`) REFERENCES `address` (`id`) ON DELETE SET NULL
    );

CREATE TABLE
    IF NOT EXISTS `bank_account` (
        `id` int NOT NULL AUTO_INCREMENT,
        `name` varchar(255) DEFAULT NULL,
        `bic` varchar(11) DEFAULT NULL,
        `rib` varchar(20) DEFAULT NULL,
        `iban` varchar(30) DEFAULT NULL,
        `currencyId` int DEFAULT NULL,
        `isMain` boolean DEFAULT TRUE,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_currency_bank_account` (`currencyId`),
        CONSTRAINT `FK_currencyId` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE SET NULL
    );

CREATE TABLE
    IF NOT EXISTS `payment_condition` (
        `id` int NOT NULL AUTO_INCREMENT,
        `label` varchar(255) DEFAULT NULL,
        `description` varchar(1024) DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `tax` (
        `id` int NOT NULL AUTO_INCREMENT,
        `label` varchar(255) DEFAULT NULL,
        `rate` float DEFAULT NULL,
        `isSpecial` boolean DEFAULT FALSE,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `firm` (
        `id` int NOT NULL AUTO_INCREMENT,
        `name` varchar(255) NOT NULL,
        `website` varchar(255) NOT NULL,
        `isPerson` boolean DEFAULT TRUE,
        `taxIdNumber` varchar(50) DEFAULT NULL,
        `notes` varchar(1024) NOT NULL,
        `phone` varchar(25) DEFAULT NULL,
        `activityId` int DEFAULT NULL,
        `currencyId` int DEFAULT NULL,
        `paymentConditionId` int DEFAULT NULL,
        `invoicingAddressId` int DEFAULT NULL,
        `deliveryAddressId` int DEFAULT NULL,
        `cabinetId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_activity_firm` (`activityId`),
        KEY `FK_currency_firm` (`currencyId`),
        KEY `FK_paymentCondition_firm` (`paymentConditionId`),
        KEY `FK_invoicingAddress_firm` (`invoicingAddressId`),
        KEY `FK_deliveryAddress_firm` (`deliveryAddressId`),
        KEY `FK_cabinet_firm` (`cabinetId`),
        CONSTRAINT `FK_activity_firm` FOREIGN KEY (`activityId`) REFERENCES `activity` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_currency_firm` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_paymentCondition_firm` FOREIGN KEY (`paymentConditionId`) REFERENCES `payment_condition` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_invoicingAddress_firm` FOREIGN KEY (`invoicingAddressId`) REFERENCES `address` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_deliveryAddress_firm` FOREIGN KEY (`deliveryAddressId`) REFERENCES `address` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_cabinet_firm` FOREIGN KEY (`cabinetId`) REFERENCES `cabinet` (`id`) ON DELETE SET NULL
    );

CREATE TABLE
    IF NOT EXISTS `interlocutor` (
        `id` int NOT NULL AUTO_INCREMENT,
        `title` enum ('Mr.', 'Mrs.', 'Miss.', 'Ms.', 'Dr.', 'Prof.') DEFAULT NULL,
        `name` varchar(255) DEFAULT NULL,
        `surname` varchar(255) DEFAULT NULL,
        `phone` varchar(25) DEFAULT NULL,
        `email` varchar(255) DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `firm_interlocutor_entry` (
        `id` int NOT NULL AUTO_INCREMENT,
        `firmId` int NOT NULL,
        `interlocutorId` int NOT NULL,
        `isMain` boolean DEFAULT FALSE,
        `position` varchar(255) NOT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_firm_firm_interlocutor_entry` (`firmId`),
        KEY `FK_interlocutor_firm_interlocutor_entry` (`interlocutorId`),
        CONSTRAINT `FK_firm_firm_interlocutor_entry` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_interlocutor_firm_interlocutor_entry` FOREIGN KEY (`interlocutorId`) REFERENCES `interlocutor` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `quotation_meta_data` (
        `id` int NOT NULL AUTO_INCREMENT,
        `showInvoiceAddress` boolean DEFAULT TRUE,
        `showDeliveryAddress` boolean DEFAULT TRUE,
        `showArticleDescription` boolean DEFAULT TRUE,
        `hasBankingDetails` boolean DEFAULT TRUE,
        `hasGeneralConditions` boolean DEFAULT TRUE,
        `hasTaxStamp` boolean DEFAULT TRUE,
        `taxSummary` json DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `quotation` (
        `id` int NOT NULL AUTO_INCREMENT,
        `sequential` varchar(25) NOT NULL UNIQUE,
        `date` datetime DEFAULT NULL,
        `dueDate` datetime DEFAULT NULL,
        `object` varchar(255) DEFAULT NULL,
        `generalConditions` varchar(1024) DEFAULT NULL,
        `status` enum (
            'quotation.status.non_existent',
            'quotation.status.expired',
            'quotation.status.draft',
            'quotation.status.validated',
            'quotation.status.sent',
            'quotation.status.accepted',
            'quotation.status.rejected'
        ) DEFAULT NULL,
        `discount` float DEFAULT NULL,
        `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
        `subTotal` float DEFAULT NULL,
        `total` float DEFAULT NULL,
        `currencyId` int NOT NULL,
        `firmId` int NOT NULL,
        `interlocutorId` int NOT NULL,
        `cabinetId` int NOT NULL,
        `quotationMetaDataId` int NOT NULL,
        `notes` varchar(1024) DEFAULT NULL,
        `taxStamp` float DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_currency_quotation` (`currencyId`),
        KEY `FK_firm_quotation` (`firmId`),
        KEY `FK_interlocutor_quotation` (`interlocutorId`),
        KEY `FK_cabinet_quotation` (`cabinetId`),
        KEY `FK_quotation_meta_data_quotation` (`quotationMetaDataId`),
        CONSTRAINT `FK_currency_quotation` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_firm_quotation` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_interlocutor_quotation` FOREIGN KEY (`interlocutorId`) REFERENCES `interlocutor` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_cabinet_quotation` FOREIGN KEY (`cabinetId`) REFERENCES `cabinet` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_quotation_meta_data_quotation` FOREIGN KEY (`quotationMetaDataId`) REFERENCES `quotation_meta_data` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `article-quotation-entry` (
        `id` int NOT NULL AUTO_INCREMENT,
        `unit_price` float DEFAULT NULL,
        `quantity` float DEFAULT NULL,
        `discount` float DEFAULT NULL,
        `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
        `subTotal` float DEFAULT NULL,
        `total` float DEFAULT NULL,
        `articleId` int DEFAULT NULL,
        `quotationId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_article_article-quotation-entry` (`articleId`),
        KEY `FK_quotation_article-quotation-entry` (`quotationId`),
        CONSTRAINT `FK_article_article-quotation-entry` FOREIGN KEY (`articleId`) REFERENCES `article` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_quotation_article-quotation-entry` FOREIGN KEY (`quotationId`) REFERENCES `quotation` (`id`) ON DELETE SET NULL
    );

CREATE TABLE
    IF NOT EXISTS `article-quotation-entry-tax` (
        `id` int NOT NULL AUTO_INCREMENT,
        `articleQuotationEntryId` int NOT NULL,
        `taxId` int NOT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_articleQuotationEntry_article-quotation-entry-tax` (`articleQuotationEntryId`),
        KEY `FK_tax_article-quotation-entry-tax` (`taxId`),
        CONSTRAINT `FK_articleQuotationEntry_article-quotation-entry-tax` FOREIGN KEY (`articleQuotationEntryId`) REFERENCES `article-quotation-entry` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_tax_article-quotation-entry-tax` FOREIGN KEY (`taxId`) REFERENCES `tax` (`id`) ON DELETE CASCADE
    );