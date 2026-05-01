-- schema.sql
-- Full schema definitions for the current Laravel application.
-- Run this in phpMyAdmin as SQL to create or inspect tables.
-- The bottom section includes ALTER statements for existing tables, especially `settings` and `notification_reads`.

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `offices` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `offices_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN','HEAD','STAFF','VIEWER') NOT NULL DEFAULT 'STAFF',
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `office_id` VARCHAR(36) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_office_id_index` (`office_id`),
  CONSTRAINT `users_office_id_foreign` FOREIGN KEY (`office_id`) REFERENCES `offices` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(255) NOT NULL,
  `user_id` BIGINT UNSIGNED NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `payload` LONGTEXT NOT NULL,
  `last_activity` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `agendas` (
  `id` VARCHAR(25) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `attachment_url` TEXT NULL,
  `attachment_name` VARCHAR(255) NULL,
  `attachment_size` INT NULL,
  `status` ENUM('PENDING','APPROVED','REJECTED','FORWARDED','ARCHIVED') NOT NULL DEFAULT 'PENDING',
  `created_by_id` VARCHAR(36) NOT NULL,
  `sender_office_id` VARCHAR(36) NULL,
  `receiver_office_id` VARCHAR(36) NULL,
  `current_office_id` VARCHAR(36) NULL,
  `approved_by_id` VARCHAR(36) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `agendas_created_by_id_foreign` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`),
  CONSTRAINT `agendas_sender_office_id_foreign` FOREIGN KEY (`sender_office_id`) REFERENCES `offices` (`id`),
  CONSTRAINT `agendas_receiver_office_id_foreign` FOREIGN KEY (`receiver_office_id`) REFERENCES `offices` (`id`),
  CONSTRAINT `agendas_current_office_id_foreign` FOREIGN KEY (`current_office_id`) REFERENCES `offices` (`id`),
  CONSTRAINT `agendas_approved_by_id_foreign` FOREIGN KEY (`approved_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `approval_histories` (
  `id` VARCHAR(25) NOT NULL,
  `agenda_id` VARCHAR(25) NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `comment` TEXT NULL,
  `action_by_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `approval_histories_agenda_id_foreign` FOREIGN KEY (`agenda_id`) REFERENCES `agendas` (`id`),
  CONSTRAINT `approval_histories_action_by_id_foreign` FOREIGN KEY (`action_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `agenda_routes` (
  `id` VARCHAR(25) NOT NULL,
  `agenda_id` VARCHAR(25) NOT NULL,
  `from_office_id` VARCHAR(36) NOT NULL,
  `to_office_id` VARCHAR(36) NOT NULL,
  `routed_by_id` VARCHAR(36) NOT NULL,
  `routed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `agenda_routes_agenda_id_foreign` FOREIGN KEY (`agenda_id`) REFERENCES `agendas` (`id`),
  CONSTRAINT `agenda_routes_from_office_id_foreign` FOREIGN KEY (`from_office_id`) REFERENCES `offices` (`id`),
  CONSTRAINT `agenda_routes_to_office_id_foreign` FOREIGN KEY (`to_office_id`) REFERENCES `offices` (`id`),
  CONSTRAINT `agenda_routes_routed_by_id_foreign` FOREIGN KEY (`routed_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `announcements` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `author_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `announcements_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `settings` (
  `key` VARCHAR(25) NOT NULL,
  `value` TEXT NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(36) NULL,
  `user_name` VARCHAR(255) NULL,
  `user_role` VARCHAR(20) NULL,
  `action` VARCHAR(255) NOT NULL,
  `category` VARCHAR(255) NOT NULL,
  `details` TEXT NOT NULL,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id_index` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `notification_reads` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(36) NOT NULL,
  `notification_id` VARCHAR(255) NOT NULL,
  `read_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `notification_reads_user_id_notification_id_unique` (`user_id`,`notification_id`),
  KEY `notification_reads_user_id_index` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ALTER SECTION: Run these statements only if the table already exists and needs to be fixed.
-- 1) Fix the settings table primary key and remove the old `id` column if present.
ALTER TABLE `settings` DROP PRIMARY KEY;
ALTER TABLE `settings` DROP COLUMN IF EXISTS `id`;
ALTER TABLE `settings` MODIFY `key` VARCHAR(25) NOT NULL;
ALTER TABLE `settings` ADD PRIMARY KEY (`key`);

-- 2) Ensure notification_reads has the correct columns and index.
ALTER TABLE `notification_reads` MODIFY `user_id` VARCHAR(36) NOT NULL;
ALTER TABLE `notification_reads` MODIFY `notification_id` VARCHAR(255) NOT NULL;
ALTER TABLE `notification_reads` DROP INDEX IF EXISTS `notification_reads_user_id_notification_id_unique`;
ALTER TABLE `notification_reads` DROP INDEX IF EXISTS `notification_reads_user_id_index`;
ALTER TABLE `notification_reads` ADD UNIQUE KEY `notification_reads_user_id_notification_id_unique` (`user_id`,`notification_id`);
ALTER TABLE `notification_reads` ADD KEY `notification_reads_user_id_index` (`user_id`);
