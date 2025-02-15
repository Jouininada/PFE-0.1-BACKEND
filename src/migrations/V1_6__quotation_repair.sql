UPDATE `quotation`
SET
    `total` = `total` - IFNULL (`taxStamp`, 0);

ALTER TABLE `quotation`
DROP COLUMN `taxStamp`;

ALTER TABLE `quotation_meta_data`
DROP COLUMN `hasTaxStamp`;

ALTER TABLE `tax`
RENAME COLUMN `rate` TO `value`;

UPDATE `tax`
SET
    `value` = `value` * 100;

ALTER TABLE `tax`
ADD COLUMN `isRate` BOOLEAN DEFAULT TRUE;