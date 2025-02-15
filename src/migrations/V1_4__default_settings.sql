CREATE TABLE
    IF NOT EXISTS `default-condition` (
        `id` INT,
        `document_type` ENUM ('quotation', 'invoice') DEFAULT NULL,
        `activity_type` ENUM ('selling', 'buying') DEFAULT NULL,
        `value` VARCHAR(1024) DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

INSERT INTO
    `default-condition` (`id`, `document_type`, `activity_type`, `value`)
VALUES
    (1, 'quotation', 'selling', ''),
    (2, 'invoice', 'selling', ''),
    (3, 'quotation', 'buying', ''),
    (4, 'invoice', 'buying', '');