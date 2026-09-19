-- SlotB Database Seed Data for Gym Partner Module
-- Seed default demo gym partner: 123@gym / 123 (hashed via password_hash)

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Insert or update default demo gym partner
-- Bcrypt hash for password '123': $2y$10$f66/6L2RkmXGv79c9G2zIuv5bY3n2pC8/u0wYnsqjR.kS3hDkK0qO (or computed via PHP)
INSERT INTO `partners` (`id`, `login_id`, `email`, `password`, `password_hash`, `business_type`, `name`, `mobile`, `phone`, `category`, `rating`, `review_count`, `jobs_completed`, `months_joined`, `is_verified`, `wallet_balance`, `bank_name`, `bank_account`, `status`)
VALUES (2, '123@gym', '123@gym', '$2y$10$P24eTcmL8Fj9iNnC5yP8A.qZcZz68gSsmrZ8V48R1VfL933hS2oE.', '$2y$10$P24eTcmL8Fj9iNnC5yP8A.qZcZz68gSsmrZ8V48R1VfL933hS2oE.', 'gym', 'Vikram Rathore', '+91 98351 23456', '+91 98351 23456', 'Gym Owner', 4.92, 64, 0, 14, 1, 48500.00, 'State Bank of India', '•••• 7712', 'active')
ON DUPLICATE KEY UPDATE
  `login_id` = '123@gym',
  `password` = VALUES(`password`),
  `password_hash` = VALUES(`password_hash`),
  `business_type` = 'gym',
  `name` = 'Vikram Rathore';

-- 2. Insert or update demo gym business
INSERT INTO `gym_businesses` (`id`, `partner_id`, `gym_name`, `description`, `address`, `latitude`, `longitude`, `admission_info`, `opening_time`, `closing_time`)
VALUES (1, 2, 'SlotB Fitness & Crossfit', 'Premier air-conditioned fitness center equipped with modern strength machines, cardio zone, CrossFit rig, and personal certified trainers.', 'Plot 42, Power House Road, Near Kali Mandir, Begusarai, Bihar - 851101', 25.41820000, 86.12720000, 'One-time registration fee: ₹200. Government ID proof and locker deposit required at admission.', '06:00 AM', '10:00 PM')
ON DUPLICATE KEY UPDATE
  `gym_name` = VALUES(`gym_name`),
  `description` = VALUES(`description`),
  `address` = VALUES(`address`),
  `admission_info` = VALUES(`admission_info`),
  `opening_time` = VALUES(`opening_time`),
  `closing_time` = VALUES(`closing_time`);

-- 3. Seed Membership Plans
DELETE FROM `membership_plans` WHERE `gym_id` = 1;

INSERT INTO `membership_plans` (`id`, `gym_id`, `name`, `duration`, `fee`, `status`) VALUES
(1, 1, 'Monthly Standard', '1 Month', 1500.00, 'active'),
(2, 1, 'Quarterly Fit', '3 Months', 3999.00, 'active'),
(3, 1, 'Half-Yearly Pro', '6 Months', 7200.00, 'active'),
(4, 1, 'Annual Ultimate', '12 Months', 12500.00, 'active');

-- 4. Seed Members
DELETE FROM `members` WHERE `gym_id` = 1;

INSERT INTO `members` (`id`, `gym_id`, `name`, `mobile`, `email`, `joining_date`, `plan_id`, `status`) VALUES
(1, 1, 'Aarav Sharma', '+91 98765 11223', 'aarav.sharma@gmail.com', '2024-01-15', 2, 'active'),
(2, 1, 'Priya Verma', '+91 98112 33445', 'priya.v@outlook.com', '2024-02-01', 1, 'active'),
(3, 1, 'Rohan Mehta', '+91 97234 55667', 'rohan.mehta@yahoo.com', '2023-11-10', 4, 'active'),
(4, 1, 'Neha Singh', '+91 96345 77889', 'neha.singh@gmail.com', '2024-03-05', 3, 'active'),
(5, 1, 'Kunal Kapoor', '+91 95456 88990', 'kunal.k@gmail.com', '2024-02-20', 1, 'active'),
(6, 1, 'Ananya Roy', '+91 94567 99001', 'ananya.roy@hotmail.com', '2023-10-12', 4, 'active'),
(7, 1, 'Deepak Yadav', '+91 93678 11234', 'deepak.yadav@gmail.com', '2024-01-25', 2, 'active'),
(8, 1, 'Suresh Patel', '+91 92789 22345', 'suresh.patel@gmail.com', '2023-09-01', 1, 'inactive');

-- 5. Seed Attendance for today and recent days
DELETE FROM `attendance` WHERE `gym_id` = 1;

INSERT INTO `attendance` (`member_id`, `gym_id`, `attendance_date`, `check_in_time`, `status`) VALUES
(1, 1, CURDATE(), '06:35 AM', 'present'),
(2, 1, CURDATE(), '07:15 AM', 'present'),
(3, 1, CURDATE(), '08:02 AM', 'present'),
(4, 1, CURDATE(), '09:10 AM', 'present'),
(5, 1, CURDATE(), NULL, 'absent'),
(6, 1, CURDATE(), '05:45 PM', 'present'),
(7, 1, CURDATE(), NULL, 'absent'),
(1, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '06:40 AM', 'present'),
(2, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:20 AM', 'present'),
(3, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '08:15 AM', 'present'),
(4, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:05 AM', 'present'),
(5, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '06:50 PM', 'present'),
(6, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '05:30 PM', 'present');

-- 6. Seed Payments and Dues
DELETE FROM `payments` WHERE `gym_id` = 1;

INSERT INTO `payments` (`id`, `member_id`, `gym_id`, `plan_id`, `amount`, `payment_date`, `due_date`, `status`, `payment_method`, `notes`) VALUES
(1, 1, 1, 2, 3999.00, '2024-01-15', '2024-04-15', 'paid', 'UPI', 'Quarterly membership fee paid via PhonePe'),
(2, 2, 1, 1, 1500.00, '2024-02-01', '2024-03-01', 'paid', 'Cash', 'Monthly membership fee cash received'),
(3, 3, 1, 4, 12500.00, '2023-11-10', '2024-11-10', 'paid', 'Bank Transfer', 'Annual membership full payment'),
(4, 4, 1, 3, 7200.00, '2024-03-05', '2024-09-05', 'paid', 'UPI', 'Half-yearly plan paid via GooglePay'),
(5, 5, 1, 1, 1500.00, '2024-02-20', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'due', 'Cash', 'Monthly renewal due shortly'),
(6, 6, 1, 4, 12500.00, '2023-10-12', '2024-10-12', 'paid', 'Credit Card', 'Annual card swipe at POS terminal'),
(7, 7, 1, 2, 3999.00, '2024-01-25', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'overdue', 'UPI', 'Renewal payment pending overdue'),
(8, 2, 1, 1, 1500.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'due', 'UPI', 'Current month renewal pending');

-- 7. Seed Gym Timings / Slots
DELETE FROM `gym_timings` WHERE `gym_id` = 1;

INSERT INTO `gym_timings` (`id`, `gym_id`, `start_time`, `end_time`, `label`, `status`) VALUES
(1, 1, '06:00 AM', '08:00 AM', 'Early Birds Batch', 'active'),
(2, 1, '08:00 AM', '10:00 AM', 'Morning General Batch', 'active'),
(3, 1, '10:00 AM', '12:00 PM', 'Women Only Special Batch', 'active'),
(4, 1, '04:00 PM', '06:00 PM', 'Evening Cardio & Strength', 'active'),
(5, 1, '06:00 PM', '08:00 PM', 'Prime Peak Hours Batch', 'active'),
(6, 1, '08:00 PM', '10:00 PM', 'Late Night Fitness Session', 'active');

-- 8. Seed Reminders
DELETE FROM `reminders` WHERE `gym_id` = 1;

INSERT INTO `reminders` (`id`, `gym_id`, `member_id`, `type`, `message`, `status`) VALUES
(1, 1, 7, 'payment_due', 'Dear Deepak Yadav, your gym membership renewal fee of ₹3,999 is overdue. Please settle at front desk.', 'sent'),
(2, 1, 5, 'payment_due', 'Dear Kunal Kapoor, your monthly membership fee of ₹1,500 is due in 3 days. Thank you for training at SlotB Fitness.', 'sent');

SET FOREIGN_KEY_CHECKS = 1;
