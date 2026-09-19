-- SlotB Database Schema for Gym Partner Module
-- Compatible with MySQL 5.7+ / MariaDB 10.3+

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Partners Table (Supports both gym and service partner accounts)
CREATE TABLE IF NOT EXISTS `partners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `login_id` VARCHAR(100) UNIQUE NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NULL,
  `business_type` ENUM('gym', 'service') DEFAULT 'gym',
  `name` VARCHAR(100) NOT NULL,
  `mobile` VARCHAR(25) NOT NULL,
  `phone` VARCHAR(25) NULL,
  `category` VARCHAR(50) DEFAULT 'Gym Owner',
  `rating` DECIMAL(3,2) DEFAULT 4.90,
  `review_count` INT DEFAULT 42,
  `jobs_completed` INT DEFAULT 0,
  `months_joined` INT DEFAULT 12,
  `is_verified` TINYINT(1) DEFAULT 1,
  `wallet_balance` DECIMAL(10,2) DEFAULT 0.00,
  `bank_name` VARCHAR(50) DEFAULT 'HDFC Bank',
  `bank_account` VARCHAR(50) DEFAULT '•••• 5821',
  `status` ENUM('active', 'inactive', 'pending') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_partners_login_id` (`login_id`),
  INDEX `idx_partners_business_type` (`business_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Partner Sessions Table for Token Authentication
CREATE TABLE IF NOT EXISTS `partner_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `partner_id` INT NOT NULL,
  `token` VARCHAR(128) UNIQUE NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_sessions_token` (`token`),
  INDEX `idx_sessions_partner` (`partner_id`),
  CONSTRAINT `fk_sessions_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Gym Businesses Table
CREATE TABLE IF NOT EXISTS `gym_businesses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `partner_id` INT NOT NULL,
  `gym_name` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `address` TEXT NOT NULL,
  `latitude` DECIMAL(10, 8) DEFAULT 25.4182,
  `longitude` DECIMAL(11, 8) DEFAULT 86.1272,
  `admission_info` TEXT NULL,
  `opening_time` VARCHAR(20) DEFAULT '06:00 AM',
  `closing_time` VARCHAR(20) DEFAULT '10:00 PM',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_gym_partner` (`partner_id`),
  CONSTRAINT `fk_gym_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Membership Plans Table
CREATE TABLE IF NOT EXISTS `membership_plans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `gym_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `duration` VARCHAR(50) NOT NULL,
  `fee` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_plans_gym` (`gym_id`),
  CONSTRAINT `fk_plans_gym` FOREIGN KEY (`gym_id`) REFERENCES `gym_businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Members Table
CREATE TABLE IF NOT EXISTS `members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `gym_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `mobile` VARCHAR(25) NOT NULL,
  `email` VARCHAR(100) NULL,
  `joining_date` DATE NOT NULL,
  `plan_id` INT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_members_gym` (`gym_id`),
  INDEX `idx_members_plan` (`plan_id`),
  INDEX `idx_members_status` (`status`),
  CONSTRAINT `fk_members_gym` FOREIGN KEY (`gym_id`) REFERENCES `gym_businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_members_plan` FOREIGN KEY (`plan_id`) REFERENCES `membership_plans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Attendance Table
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_id` INT NOT NULL,
  `gym_id` INT NOT NULL,
  `attendance_date` DATE NOT NULL,
  `check_in_time` VARCHAR(20) DEFAULT NULL,
  `status` ENUM('present', 'absent') DEFAULT 'present',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_member_date` (`member_id`, `attendance_date`),
  INDEX `idx_att_gym_date` (`gym_id`, `attendance_date`),
  INDEX `idx_att_member` (`member_id`),
  CONSTRAINT `fk_att_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_gym` FOREIGN KEY (`gym_id`) REFERENCES `gym_businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Payments Table
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_id` INT NOT NULL,
  `gym_id` INT NOT NULL,
  `plan_id` INT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `payment_date` DATE NOT NULL,
  `due_date` DATE NULL,
  `status` ENUM('paid', 'due', 'overdue') DEFAULT 'paid',
  `payment_method` VARCHAR(50) DEFAULT 'UPI',
  `notes` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_payments_gym` (`gym_id`),
  INDEX `idx_payments_member` (`member_id`),
  INDEX `idx_payments_status` (`status`),
  CONSTRAINT `fk_pay_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pay_gym` FOREIGN KEY (`gym_id`) REFERENCES `gym_businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pay_plan` FOREIGN KEY (`plan_id`) REFERENCES `membership_plans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Gym Timings Table
CREATE TABLE IF NOT EXISTS `gym_timings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `gym_id` INT NOT NULL,
  `start_time` VARCHAR(20) NOT NULL,
  `end_time` VARCHAR(20) NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_timings_gym` (`gym_id`),
  CONSTRAINT `fk_timings_gym` FOREIGN KEY (`gym_id`) REFERENCES `gym_businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Reminders Table
CREATE TABLE IF NOT EXISTS `reminders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `gym_id` INT NOT NULL,
  `member_id` INT NOT NULL,
  `type` VARCHAR(50) DEFAULT 'payment_due',
  `message` TEXT NOT NULL,
  `status` ENUM('sent', 'pending') DEFAULT 'sent',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_reminders_gym` (`gym_id`),
  INDEX `idx_reminders_member` (`member_id`),
  CONSTRAINT `fk_rem_gym` FOREIGN KEY (`gym_id`) REFERENCES `gym_businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rem_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
