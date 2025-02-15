ALTER TABLE `quotation`
MODIFY `status` ENUM(
    'quotation.status.non_existent',
    'quotation.status.expired',
    'quotation.status.draft',
    'quotation.status.validated',
    'quotation.status.sent',
    'quotation.status.accepted',
    'quotation.status.rejected',
    'quotation.status.invoiced',
    'quotation.status.archived'
) DEFAULT NULL;

ALTER TABLE `invoice`
ADD COLUMN `quotationId` INT NULL,
ADD CONSTRAINT `FK_invoice_quotation` FOREIGN KEY (`quotationId`) REFERENCES `quotation` (`id`) ON DELETE SET NULL;

ALTER TABLE `invoice`
ADD COLUMN `taxStampId` INT NULL,
ADD CONSTRAINT `FK_invoice_tax` FOREIGN KEY (`taxStampId`) REFERENCES `tax` (`id`) ON DELETE SET NULL;


ALTER TABLE `invoice_meta_data` 
ADD COLUMN `hasTaxStamp` boolean DEFAULT FALSE;