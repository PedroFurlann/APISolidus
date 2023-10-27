-- DropForeignKey
ALTER TABLE `Messages` DROP FOREIGN KEY `Messages_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Transactions` DROP FOREIGN KEY `Transactions_userId_fkey`;

-- RenameIndex
ALTER TABLE `Messages` RENAME INDEX `Messages_userId_fkey` TO `Messages_userId_idx`;

-- RenameIndex
ALTER TABLE `Transactions` RENAME INDEX `Transactions_userId_fkey` TO `Transactions_userId_idx`;
