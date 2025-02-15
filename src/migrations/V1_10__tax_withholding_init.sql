CREATE TABLE IF NOT EXISTS `tax-withholding` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(255) DEFAULT NULL,
    `rate` FLOAT DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`id`)
);

INSERT INTO `tax-withholding` (`label`, `rate`)
VALUES
    ('Frais - Régime forfaitaire', 10),
    ('Frais - Régime forfaitaire', 15),
    ('Frais - Régime réel', 3),
    ('Frais - Régime réel', 5),
    ('Loyer - Frais spéciaux - Société exportation', 2.5),
    ('Marché - Frais généraux', 1),
    ('Marché - Frais généraux', 1.5),
    ('Marché - Frais spéciaux - Société exportation', 0.5),
    ('Revenus des comptes épargne spéciaux', 20);

ALTER TABLE `invoice`
ADD COLUMN `taxWithholdingId` INT NULL,
ADD CONSTRAINT `FK_invoice_tax_withholding` 
    FOREIGN KEY (`taxWithholdingId`) 
    REFERENCES `tax-withholding` (`id`) 
    ON DELETE SET NULL;

ALTER TABLE `invoice_meta_data`
ADD COLUMN `hasTaxWithholding` BOOLEAN DEFAULT FALSE;

ALTER TABLE `invoice`
ADD COLUMN `taxWithholdingAmount` FLOAT DEFAULT NULL;
