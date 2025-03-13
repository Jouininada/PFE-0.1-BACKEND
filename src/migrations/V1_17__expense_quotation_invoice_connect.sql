-- Migration 2 : Modifications et ajouts de colonnes

-- Ajout de la colonne 'hasTaxStamp' dans la table 'expense_invoice_meta_data'
ALTER TABLE `expense_invoice_meta_data`
ADD COLUMN `hasTaxStamp` BOOLEAN DEFAULT FALSE;

-- Modification de la colonne 'status' dans la table 'expense_quotation'
ALTER TABLE `expense_quotation`
MODIFY `status` ENUM(
    'expense_quotation.status.non_existent',
    'expense_quotation.status.expired',
    'expense_quotation.status.draft',
    'expense_quotation.status.validated',
    'expense_quotation.status.sent',
    'expense_quotation.status.accepted',
    'expense_quotation.status.rejected',
    'expense_quotation.status.invoiced',
    'expense_quotation.status.archived'
) DEFAULT NULL;

-- Ajout de la colonne 'quotationId' et contrainte de clé étrangère dans la table 'expense_invoice'
ALTER TABLE `expense_invoice`
ADD COLUMN `quotationId` INT DEFAULT NULL,
ADD CONSTRAINT `FK_expense_invoice_expense_quotation` FOREIGN KEY (`quotationId`) REFERENCES `expense_quotation` (`id`) ON DELETE SET NULL;

-- Ajout de la colonne 'taxStampId' et contrainte de clé étrangère dans la table 'expense_invoice'
ALTER TABLE `expense_invoice`
ADD COLUMN `taxStampId` INT DEFAULT NULL,
ADD CONSTRAINT `FK_expense_invoice_tax` FOREIGN KEY (`taxStampId`) REFERENCES `tax` (`id`) ON DELETE SET NULL;