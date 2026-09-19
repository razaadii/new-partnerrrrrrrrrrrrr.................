<?php
// backend/init_db.php
require_once __DIR__ . '/config/database.php';

try {
    // 1. Create partners table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS partners (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(25) NOT NULL,
            category VARCHAR(50) NOT NULL,
            rating DECIMAL(3,2) DEFAULT 4.80,
            review_count INT DEFAULT 128,
            jobs_completed INT DEFAULT 156,
            months_joined INT DEFAULT 8,
            is_verified TINYINT(1) DEFAULT 1,
            wallet_balance DECIMAL(10,2) DEFAULT 2450.00,
            bank_name VARCHAR(50) DEFAULT 'HDFC Bank',
            bank_account VARCHAR(50) DEFAULT '•••• 4892',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // 2. Create jobs table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS jobs (
            id VARCHAR(50) PRIMARY KEY,
            partner_id INT DEFAULT 1,
            service_title VARCHAR(100) NOT NULL,
            category VARCHAR(50) DEFAULT 'AC Technician',
            customer_name VARCHAR(100) NOT NULL,
            customer_phone VARCHAR(25) NOT NULL,
            customer_address TEXT NOT NULL,
            scheduled_time VARCHAR(100) NOT NULL,
            started_at VARCHAR(50) DEFAULT NULL,
            amount DECIMAL(10,2) NOT NULL,
            distance VARCHAR(50) DEFAULT '2.3 KM',
            estimated_time VARCHAR(50) DEFAULT '8 Minutes',
            status ENUM('active', 'pending', 'completed') DEFAULT 'pending',
            verification_code VARCHAR(10) DEFAULT '1254',
            notes TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // 3. Create transactions table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR(50) PRIMARY KEY,
            partner_id INT DEFAULT 1,
            title VARCHAR(150) NOT NULL,
            type ENUM('job', 'bonus', 'withdrawal', 'tip') NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            status ENUM('credited', 'processing', 'withdrawn') DEFAULT 'credited',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // Seed default partner: 123@aadii / 123
    $stmt = $pdo->prepare("SELECT id FROM partners WHERE email = ?");
    $stmt->execute(['123@aadii']);
    $existingPartner = $stmt->fetch();

    if (!$existingPartner) {
        $stmtInsert = $pdo->prepare("
            INSERT INTO partners (name, email, password, phone, category, rating, review_count, jobs_completed, months_joined, is_verified, wallet_balance, bank_name, bank_account)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmtInsert->execute([
            'Rohit Kumar',
            '123@aadii',
            '123', // Direct check for '123' as requested
            '+91 91234 56789',
            'AC Technician',
            4.80,
            128,
            156,
            8,
            1,
            2450.00,
            'HDFC Bank',
            '•••• 4892'
        ]);
        echo "Default partner created: 123@aadii (password: 123)\n";
    } else {
        // Ensure password is 123
        $pdo->prepare("UPDATE partners SET password = '123' WHERE email = '123@aadii'")->execute();
        echo "Default partner 123@aadii verified.\n";
    }

    // Seed initial jobs
    $jobsCount = $pdo->query("SELECT COUNT(*) FROM jobs")->fetchColumn();
    if ($jobsCount == 0) {
        $jobsSeed = [
            ['AC1254', 1, 'AC Installation', 'AC Technician', 'Rahul Kumar', '+91 91234 56789', 'Barauni, Ward No. 22, Near Power House Road, Begusarai, Bihar - 851101', 'Today, 10:30 AM', '10:45 AM', 699.00, '2.3 KM', '8 Minutes', 'active', '1254'],
            ['AC1255', 1, 'AC Gas Refill', 'AC Technician', 'Amit Singh', '+91 98765 43210', 'Main Market, Near Kali Mandir, Begusarai, Bihar - 851101', 'Today, 12:00 PM', NULL, 899.00, '4.1 KM', '15 Minutes', 'pending', '4567'],
            ['AC1250', 1, 'AC Service', 'AC Technician', 'Rakesh Kumar', '+91 91122 33445', 'Teghra Bazar, Ward No. 5, Begusarai, Bihar - 851133', 'Today, 02:30 PM', '02:40 PM', 499.00, '6.8 KM', '22 Minutes', 'completed', '8912'],
            ['AC1256', 1, 'AC Repair', 'AC Technician', 'Vikash Kumar', '+91 99887 76655', 'Harrakh Kothi, Near Overbridge, Begusarai, Bihar - 851101', 'Today, 04:30 PM', NULL, 599.00, '3.2 KM', '11 Minutes', 'pending', '3341'],
            ['AC1248', 1, 'AC Maintenance', 'AC Technician', 'Sanjeet Kumar', '+91 92233 44556', 'IOCL Township, Barauni, Begusarai, Bihar - 851117', 'Today, 06:00 PM', '06:10 PM', 399.00, '5.0 KM', '18 Minutes', 'completed', '9081']
        ];

        $stmtJob = $pdo->prepare("
            INSERT INTO jobs (id, partner_id, service_title, category, customer_name, customer_phone, customer_address, scheduled_time, started_at, amount, distance, estimated_time, status, verification_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        foreach ($jobsSeed as $job) {
            $stmtJob->execute($job);
        }
        echo "Seeded " . count($jobsSeed) . " jobs.\n";
    }

    // Seed initial transactions
    $txnCount = $pdo->query("SELECT COUNT(*) FROM transactions")->fetchColumn();
    if ($txnCount == 0) {
        $txnSeed = [
            ['TXN-901', 1, 'AC Installation • Rahul Kumar', 'job', 699.00, 'credited'],
            ['TXN-902', 1, 'Customer Tip • Rahul Kumar', 'tip', 100.00, 'credited'],
            ['TXN-898', 1, 'AC Service • Rakesh Kumar', 'job', 499.00, 'credited'],
            ['TXN-895', 1, 'AC Maintenance • Sanjeet Kumar', 'job', 399.00, 'credited'],
            ['TXN-880', 1, 'Weekly Performance Bonus', 'bonus', 753.00, 'credited']
        ];

        $stmtTxn = $pdo->prepare("
            INSERT INTO transactions (id, partner_id, title, type, amount, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        foreach ($txnSeed as $txn) {
            $stmtTxn->execute($txn);
        }
        echo "Seeded " . count($txnSeed) . " transactions.\n";
    }

    echo "Database initialization completed successfully!\n";
} catch (Exception $e) {
    echo "Initialization error: " . $e->getMessage() . "\n";
}
