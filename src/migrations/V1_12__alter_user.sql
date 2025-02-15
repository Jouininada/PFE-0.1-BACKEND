ALTER TABLE `user`
ADD COLUMN refreshToken VARCHAR(255) NULL;

ALTER TABLE `user`
ADD COLUMN `roleId` INT DEFAULT NULL,
ADD KEY `user_role_index` (`roleId`),
ADD CONSTRAINT `FK_user_role` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`);

ALTER TABLE `user`
ADD COLUMN `pictureId` INT DEFAULT NULL,
ADD KEY `user_picture_index` (`pictureId`),
ADD CONSTRAINT `FK_user_picture` FOREIGN KEY (`pictureId`) REFERENCES `upload` (`id`);

ALTER TABLE `user`
ADD COLUMN isActive BOOLEAN NOT NULL DEFAULT TRUE;