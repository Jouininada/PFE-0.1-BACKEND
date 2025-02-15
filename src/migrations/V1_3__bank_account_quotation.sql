ALTER TABLE `quotation`
ADD COLUMN `bankAccountId` int DEFAULT NULL,
ADD CONSTRAINT `FK_bank_account_quotation` FOREIGN KEY (`bankAccountId`) REFERENCES `bank_account` (`id`) ON DELETE SET NULL;

CREATE TABLE
    IF NOT EXISTS upload (
        `id` INT AUTO_INCREMENT,
        `slug` VARCHAR(255) NOT NULL,
        `filename` VARCHAR(255) NOT NULL,
        `relativePath` VARCHAR(255) NOT NULL,
        `mimetype` VARCHAR(255) NOT NULL,
        `size` FLOAT NOT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `quotation-upload` (
        `id` int NOT NULL AUTO_INCREMENT,
        `quotationId` int DEFAULT NULL,
        `uploadId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_quotation_quotation-upload` (`quotationId`),
        KEY `FK_upload_quotation-upload` (`uploadId`),
        CONSTRAINT `FK_quotation_quotation-upload` FOREIGN KEY (`quotationId`) REFERENCES `quotation` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_upload_quotation-upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
    );