CREATE TABLE
    IF NOT EXISTS `payment` (
        `id` int NOT NULL AUTO_INCREMENT,
        `amount` float DEFAULT NULL,
        `fee` float DEFAULT NULL,
        `convertionRate` float DEFAULT NULL,
        `date` datetime DEFAULT NULL,
        `mode` enum (
            'payment.payment_mode.cash',
            'payment.payment_mode.credit_card',
            'payment.payment_mode.check',
            'payment.payment_mode.bank_transfer',
            'payment.payment_mode.wire_transfer'
        ) DEFAULT NULL,
        `currencyId` int NOT NULL,
        `firmId` int NOT NULL,
        `notes` varchar(1024) DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_firm_payment` (`firmId`),
        KEY `FK_currency_payment` (`currencyId`),
        CONSTRAINT `FK_firm_payment` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_currency_payment` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `payment-upload` (
        `id` int NOT NULL AUTO_INCREMENT,
        `paymentId` int DEFAULT NULL,
        `uploadId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_payment_payment-upload` (`paymentId`),
        KEY `FK_upload_payment-upload` (`uploadId`),
        CONSTRAINT `FK_payment_payment-upload` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_upload_payment-upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `payment-invoice_entry` (
        `id` int NOT NULL AUTO_INCREMENT,
        `paymentId` int DEFAULT NULL,
        `invoiceId` int DEFAULT NULL,
        `amount` float DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_payment_payment-invoice` (`paymentId`),
        KEY `FK_invoice_payment-invoice` (`invoiceId`),
        CONSTRAINT `FK_payment_payment-invoice` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_invoice_payment-invoice` FOREIGN KEY (`invoiceId`) REFERENCES `invoice` (`id`) ON DELETE CASCADE
    );

ALTER TABLE `invoice`
ADD COLUMN `amountPaid` float DEFAULT 0;

ALTER TABLE `invoice` MODIFY `status` ENUM (
    'invoice.status.non_existent',
    'invoice.status.draft',
    'invoice.status.sent',
    'invoice.status.validated',
    'invoice.status.paid',
    'invoice.status.partially_paid',
    'invoice.status.unpaid',
    'invoice.status.expired',
    'invoice.status.archived'
) DEFAULT NULL;