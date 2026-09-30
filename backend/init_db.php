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

    // Ensure newer schema columns exist
    try {
        $pdo->exec("ALTER TABLE partners ADD COLUMN IF NOT EXISTS login_id VARCHAR(100) NULL");
        $pdo->exec("ALTER TABLE partners ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'service'");
        $pdo->exec("ALTER TABLE partners ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL");
        $pdo->exec("ALTER TABLE partners ADD COLUMN IF NOT EXISTS mobile VARCHAR(25) NULL");
    } catch (Exception $e) {
        // Ignore column add errors if database doesn't support IF NOT EXISTS
    }

    // Seed Partners Array
    $partnersSeed = [
        [
            'id' => 1,
            'login_id' => '123@aadii',
            'email' => '123@aadii',
            'name' => 'Rohit Kumar',
            'category' => 'AC Technician',
            'business_type' => 'service',
            'phone' => '+91 91234 56789',
            'rating' => 4.80,
            'review_count' => 128,
            'jobs_completed' => 156,
            'wallet_balance' => 2450.00,
        ],
        [
            'id' => 3,
            'login_id' => '123@appliance',
            'email' => '123@appliance',
            'name' => 'Rajesh Sharma',
            'category' => 'Home Appliances Specialist',
            'business_type' => 'service',
            'phone' => '+91 98234 56781',
            'rating' => 4.88,
            'review_count' => 142,
            'jobs_completed' => 184,
            'wallet_balance' => 3200.00,
        ],
        [
            'id' => 4,
            'login_id' => '123@plumber',
            'email' => '123@plumber',
            'name' => 'Manoj Mistri',
            'category' => 'Master Plumber',
            'business_type' => 'service',
            'phone' => '+91 97345 67892',
            'rating' => 4.85,
            'review_count' => 168,
            'jobs_completed' => 210,
            'wallet_balance' => 2850.00,
        ],
        [
            'id' => 5,
            'login_id' => '123@electrician',
            'email' => '123@electrician',
            'name' => 'Sunil Verma',
            'category' => 'Certified Electrician',
            'business_type' => 'service',
            'phone' => '+91 96456 78903',
            'rating' => 4.90,
            'review_count' => 195,
            'jobs_completed' => 240,
            'wallet_balance' => 3600.00,
        ],
        [
            'id' => 6,
            'login_id' => '123@instant',
            'email' => '123@instant',
            'name' => 'Ajay Singh',
            'category' => 'Instant Rapid Help Responder',
            'business_type' => 'service',
            'phone' => '+91 95567 89014',
            'rating' => 4.95,
            'review_count' => 230,
            'jobs_completed' => 310,
            'wallet_balance' => 4100.00,
        ],
    ];

    $hash123 = password_hash('123', PASSWORD_BCRYPT);

    foreach ($partnersSeed as $p) {
        $stmt = $pdo->prepare("SELECT id FROM partners WHERE email = ? OR login_id = ?");
        $stmt->execute([$p['email'], $p['login_id']]);
        $existing = $stmt->fetch();

        if (!$existing) {
            $stmtInsert = $pdo->prepare("
                INSERT INTO partners (id, login_id, email, password, password_hash, business_type, name, phone, mobile, category, rating, review_count, jobs_completed, months_joined, is_verified, wallet_balance, bank_name, bank_account)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 8, 1, ?, 'HDFC Bank', '•••• 4892')
            ");
            $stmtInsert->execute([
                $p['id'],
                $p['login_id'],
                $p['email'],
                '123',
                $hash123,
                $p['business_type'],
                $p['name'],
                $p['phone'],
                $p['phone'],
                $p['category'],
                $p['rating'],
                $p['review_count'],
                $p['jobs_completed'],
                $p['wallet_balance']
            ]);
            echo "Seeded partner: {$p['login_id']} ({$p['name']} - {$p['category']})\n";
        } else {
            $pdo->prepare("
                UPDATE partners 
                SET password = '123', 
                    password_hash = ?, 
                    login_id = ?, 
                    name = ?, 
                    category = ?, 
                    business_type = ? 
                WHERE id = ?
            ")->execute([$hash123, $p['login_id'], $p['name'], $p['category'], $p['business_type'], $existing['id']]);
        }
    }

    // Seed Multi-Service Jobs
    $allJobsSeed = [
        // AC Tech (Partner 1)
        ['AC1254', 1, 'AC Installation', 'AC Technician', 'Rahul Kumar', '+91 91234 56789', 'Barauni, Ward No. 22, Near Power House Road, Begusarai, Bihar - 851101', 'Today, 10:30 AM', '10:45 AM', 699.00, '2.3 KM', '8 Minutes', 'active', '4892'],
        ['AC1255', 1, 'AC Gas Refill', 'AC Technician', 'Amit Singh', '+91 98765 43210', 'Main Market, Near Kali Mandir, Begusarai, Bihar - 851101', 'Today, 12:00 PM', NULL, 899.00, '4.1 KM', '15 Minutes', 'pending', '4567'],
        ['AC1250', 1, 'AC Service', 'AC Technician', 'Rakesh Kumar', '+91 91122 33445', 'Teghra Bazar, Ward No. 5, Begusarai, Bihar - 851133', 'Today, 02:30 PM', '02:40 PM', 499.00, '6.8 KM', '22 Minutes', 'completed', '8912'],
        ['AC1256', 1, 'AC Repair', 'AC Technician', 'Vikash Kumar', '+91 99887 76655', 'Harrakh Kothi, Near Overbridge, Begusarai, Bihar - 851101', 'Today, 04:30 PM', NULL, 599.00, '3.2 KM', '11 Minutes', 'pending', '3341'],
        ['AC1248', 1, 'AC Maintenance', 'AC Technician', 'Sanjeet Kumar', '+91 92233 44556', 'IOCL Township, Barauni, Begusarai, Bihar - 851117', 'Today, 06:00 PM', '06:10 PM', 399.00, '5.0 KM', '18 Minutes', 'completed', '9081'],

        // Appliances Repair (Partner 3)
        ['AP101', 3, 'Washing Machine Drum Repair', 'Home Appliances Specialist', 'Neha Agarwal', '+91 98351 11223', 'Barauni Sector 2, Begusarai, Bihar - 851101', 'Today, 11:00 AM', '11:15 AM', 799.00, '1.8 KM', '6 Minutes', 'active', '4892'],
        ['AP102', 3, 'Refrigerator Cooling Coil Check', 'Home Appliances Specialist', 'Vikas Verma', '+91 98223 33445', 'Kali Mandir Road, Begusarai, Bihar - 851101', 'Today, 01:30 PM', NULL, 899.00, '3.5 KM', '12 Minutes', 'pending', '2314'],
        ['AP103', 3, 'Microwave Oven Magnetron Fix', 'Home Appliances Specialist', 'Sunita Devi', '+91 98112 44556', 'Harrakh, Begusarai, Bihar - 851101', 'Today, 03:45 PM', NULL, 649.00, '4.2 KM', '14 Minutes', 'pending', '5521'],
        ['AP104', 3, 'Washing Machine Installation', 'Home Appliances Specialist', 'Ritu Raj', '+91 97223 55667', 'IOCL Colony, Begusarai, Bihar - 851117', 'Today, 05:30 PM', '05:40 PM', 499.00, '5.1 KM', '17 Minutes', 'completed', '8120'],
        ['AP105', 3, 'RO Water Purifier Filter Change', 'Home Appliances Specialist', 'Alok Mishra', '+91 96334 66778', 'Power House Road, Begusarai, Bihar - 851101', 'Today, 07:00 PM', '07:10 PM', 599.00, '2.9 KM', '9 Minutes', 'completed', '3344'],

        // Plumber (Partner 4)
        ['PL201', 4, 'Concealed Pipe Leakage Repair', 'Master Plumber', 'Ramesh Jha', '+91 95445 77889', 'Nagar Nigam Chowk, Begusarai, Bihar - 851101', 'Today, 10:15 AM', '10:30 AM', 549.00, '2.1 KM', '7 Minutes', 'active', '4892'],
        ['PL202', 4, 'Sanitary Fitting & Basin Tap', 'Master Plumber', 'Arvind Singh', '+91 94556 88990', 'Teghra Bazar, Begusarai, Bihar - 851133', 'Today, 12:45 PM', NULL, 999.00, '6.0 KM', '20 Minutes', 'pending', '7823'],
        ['PL203', 4, 'Kitchen Sink Drain Unclogging', 'Master Plumber', 'Pooja Kumari', '+91 93667 99001', 'Barauni Ward 12, Begusarai, Bihar - 851101', 'Today, 03:00 PM', NULL, 399.00, '3.8 KM', '13 Minutes', 'pending', '9012'],
        ['PL204', 4, 'Overhead Water Tank Float Valve', 'Master Plumber', 'Sandeep Roy', '+91 92778 11234', 'Harrakh, Begusarai, Bihar - 851101', 'Today, 05:15 PM', '05:25 PM', 449.00, '4.5 KM', '16 Minutes', 'completed', '4432'],
        ['PL205', 4, 'Water Motor Pump Pipeline Fix', 'Master Plumber', 'Manoj Gupta', '+91 91889 22345', 'Mirganj, Begusarai, Bihar - 851101', 'Today, 06:45 PM', '06:55 PM', 699.00, '3.0 KM', '10 Minutes', 'completed', '1987'],

        // Electrician (Partner 5)
        ['EL301', 5, 'MCB Short Circuit Inspection', 'Certified Electrician', 'Deepak Pandey', '+91 90990 33456', 'Station Road, Begusarai, Bihar - 851101', 'Today, 10:45 AM', '11:00 AM', 499.00, '1.5 KM', '5 Minutes', 'active', '4892'],
        ['EL302', 5, 'Heavy Inverter Wiring & Fan', 'Certified Electrician', 'Anand Kishore', '+91 89001 44567', 'Power House Road, Begusarai, Bihar - 851101', 'Today, 01:15 PM', NULL, 699.00, '3.1 KM', '11 Minutes', 'pending', '6721'],
        ['EL303', 5, 'Chandelier & Switchboard Setup', 'Certified Electrician', 'Priya Ranjan', '+91 88112 55678', 'GD College Road, Begusarai, Bihar - 851101', 'Today, 03:30 PM', NULL, 799.00, '4.0 KM', '14 Minutes', 'pending', '3211'],
        ['EL304', 5, 'Geyser Fitting & Safety Earthing', 'Certified Electrician', 'Gautam Roy', '+91 87223 66789', 'Barauni, Begusarai, Bihar - 851101', 'Today, 05:45 PM', '05:55 PM', 549.00, '5.3 KM', '18 Minutes', 'completed', '9876'],
        ['EL305', 5, 'Main Line Fuse Box Replacement', 'Certified Electrician', 'Vijay Kumar', '+91 86334 77890', 'Vishnupur, Begusarai, Bihar - 851101', 'Today, 07:15 PM', '07:25 PM', 849.00, '2.7 KM', '9 Minutes', 'completed', '5567'],

        // Instant Help (Partner 6)
        ['IN401', 6, 'Emergency Main Door Lock Open', 'Instant Rapid Help Responder', 'Manish Sinha', '+91 85445 88901', 'Zero Mile, Begusarai, Bihar - 851101', 'Today, 10:00 AM', '10:10 AM', 599.00, '1.2 KM', '4 Minutes', 'active', '4892'],
        ['IN402', 6, 'Sudden Pipe Burst Emergency Shutoff', 'Instant Rapid Help Responder', 'Kaushik Sen', '+91 84556 99012', 'Subhash Chowk, Begusarai, Bihar - 851101', 'Today, 12:15 PM', NULL, 699.00, '2.8 KM', '8 Minutes', 'pending', '8891'],
        ['IN403', 6, 'Power Sparking Emergency Check', 'Instant Rapid Help Responder', 'Divya Sharma', '+91 83667 00123', 'Hemra Road, Begusarai, Bihar - 851101', 'Today, 02:45 PM', NULL, 649.00, '3.9 KM', '12 Minutes', 'pending', '1102'],
        ['IN404', 6, 'Urgent Heavy Furniture Shifting', 'Instant Rapid Help Responder', 'Amit Pathak', '+91 82778 11234', 'Harrakh Kothi, Begusarai, Bihar - 851101', 'Today, 04:45 PM', '04:55 PM', 799.00, '4.6 KM', '15 Minutes', 'completed', '4982'],
        ['IN405', 6, 'Flat Tire & Battery Jumpstart', 'Instant Rapid Help Responder', 'Rakesh Yadav', '+91 81889 22345', 'NH-31 Bypass, Begusarai, Bihar - 851101', 'Today, 06:30 PM', '06:40 PM', 549.00, '5.8 KM', '19 Minutes', 'completed', '7762'],
    ];

    $stmtJob = $pdo->prepare("
        INSERT INTO jobs (id, partner_id, service_title, category, customer_name, customer_phone, customer_address, scheduled_time, started_at, amount, distance, estimated_time, status, verification_code)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            partner_id = VALUES(partner_id),
            service_title = VALUES(service_title),
            category = VALUES(category),
            amount = VALUES(amount),
            status = VALUES(status)
    ");
    foreach ($allJobsSeed as $job) {
        $stmtJob->execute($job);
    }
    echo "Seeded " . count($allJobsSeed) . " multi-service jobs.\n";

    echo "Database initialization completed successfully with all service categories!\n";
} catch (Exception $e) {
    echo "Initialization error: " . $e->getMessage() . "\n";
}
