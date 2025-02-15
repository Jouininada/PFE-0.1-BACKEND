CREATE TABLE
    IF NOT EXISTS `role` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `label` VARCHAR(255) NOT NULL,
        `description` VARCHAR(255) NOT NULL,
        `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `permission` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `label` VARCHAR(255) NOT NULL,
        `description` VARCHAR(255) NOT NULL,
        `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `role_permission` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `roleId` INT NOT NULL,
        `permissionId` INT NOT NULL,
        `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_role_permission_role` (`roleId`),
        KEY `FK_role_permission_permission` (`permissionId`),
        CONSTRAINT `FK_role_permission_role` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`),
        CONSTRAINT `FK_role_permission_permission` FOREIGN KEY (`permissionId`) REFERENCES `permission` (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `user` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `username` VARCHAR(255) NOT NULL,
        `firstName` VARCHAR(255) DEFAULT NULL,
        `lastName` VARCHAR(255) DEFAULT NULL,
        `email` VARCHAR(255) NOT NULL,
        `password` VARCHAR(255) NOT NULL,
        `dateOfBirth` datetime DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        UNIQUE KEY `user_unique_username` (`username`),
        UNIQUE KEY `user_unique_email` (`email`)
    );