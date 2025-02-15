ALTER TABLE `cabinet`
ADD COLUMN `logoId` int DEFAULT NULL,
ADD COLUMN `signatureId` int DEFAULT NULL;

ALTER TABLE `cabinet`
ADD CONSTRAINT `FK_logo_upload` FOREIGN KEY (`logoId`) REFERENCES `upload` (`id`) ON DELETE SET NULL,
ADD CONSTRAINT `FK_signature_upload` FOREIGN KEY (`signatureId`) REFERENCES `upload` (`id`) ON DELETE SET NULL;

UPDATE `cabinet`
SET `logoId` = NULL, `signatureId` = NULL
WHERE `logoId` IS NULL AND `signatureId` IS NULL;
