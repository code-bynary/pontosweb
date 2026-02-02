-- CreateTable
CREATE TABLE `abonos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workdayId` INTEGER NOT NULL,
    `type` ENUM('FULL_DAY', 'PARTIAL') NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `startTime` TIME(0) NULL,
    `endTime` TIME(0) NULL,
    `minutes` INTEGER NOT NULL,
    `document` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `abonos_workdayId_key`(`workdayId`),
    INDEX `abonos_workdayId_idx`(`workdayId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `abonos` ADD CONSTRAINT `abonos_workdayId_fkey` FOREIGN KEY (`workdayId`) REFERENCES `workdays`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
