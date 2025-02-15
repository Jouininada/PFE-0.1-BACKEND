CREATE TABLE
    `logger` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `event` VARCHAR(255) NULL,
        `api` VARCHAR(255) NULL,
        `method` VARCHAR(50) NULL,
        `userId` INT NULL,
        `logInfo` json DEFAULT NULL,
        `loggedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        KEY `FK_user_logger` (`userId`),
        CONSTRAINT `FK_user_logger` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL
    );