<?php
// backend/database/init_gym.php
// Safe migration and seed executor for SlotB Gym Partner module

require_once __DIR__ . '/../config/database.php';

echo "=== SlotB Gym Database Initializer ===\n";

try {
    // 1. Run Schema SQL
    $schemaSql = file_get_contents(__DIR__ . '/schema.sql');
    if (!$schemaSql) {
        throw new Exception("Could not read schema.sql");
    }
    $pdo->exec($schemaSql);
    echo "[OK] Schema imported successfully.\n";

    // 2. Generate secure hash for demo password '123'
    $hashedPassword = password_hash('123', PASSWORD_BCRYPT);

    // 3. Ensure partners table has required columns
    $partnerCols = $pdo->query("DESCRIBE partners")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('login_id', $partnerCols)) {
        $pdo->exec("ALTER TABLE partners ADD COLUMN login_id VARCHAR(100) UNIQUE NULL AFTER id");
    }
    if (!in_array('business_type', $partnerCols)) {
        $pdo->exec("ALTER TABLE partners ADD COLUMN business_type ENUM('gym', 'service') DEFAULT 'gym' AFTER password");
    }
    if (!in_array('password_hash', $partnerCols)) {
        $pdo->exec("ALTER TABLE partners ADD COLUMN password_hash VARCHAR(255) NULL AFTER password");
    }
    if (!in_array('mobile', $partnerCols)) {
        $pdo->exec("ALTER TABLE partners ADD COLUMN mobile VARCHAR(25) NOT NULL DEFAULT '+91 98351 23456' AFTER name");
    }
    if (!in_array('status', $partnerCols)) {
        $pdo->exec("ALTER TABLE partners ADD COLUMN status ENUM('active', 'inactive', 'pending') DEFAULT 'active' AFTER bank_account");
    }
    if (!in_array('updated_at', $partnerCols)) {
        $pdo->exec("ALTER TABLE partners ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
    }

    // 4. Run Seed SQL
    $seedSql = file_get_contents(__DIR__ . '/seed.sql');
    if (!$seedSql) {
        throw new Exception("Could not read seed.sql");
    }
    $pdo->exec($seedSql);
    echo "[OK] Seed data inserted successfully.\n";

    // 5. Update partner 123@gym with freshly generated bcrypt hash
    $stmt = $pdo->prepare("UPDATE partners SET password = ?, password_hash = ? WHERE login_id = '123@gym' OR email = '123@gym'");
    $stmt->execute([$hashedPassword, $hashedPassword]);

    // 6. Verify password verification
    $checkPartner = $pdo->query("SELECT id, login_id, email, password, password_hash, business_type FROM partners WHERE login_id = '123@gym' OR email = '123@gym'")->fetch();
    if ($checkPartner && password_verify('123', $checkPartner['password'])) {
        echo "[SUCCESS] Demo Gym Partner verified!\n";
        echo " - Login ID: " . $checkPartner['login_id'] . "\n";
        echo " - Password: 123 (Verified via password_verify)\n";
        echo " - Business Type: " . $checkPartner['business_type'] . "\n";
    } else {
        throw new Exception("Demo partner password verification failed.");
    }

    // 7. Verify tables summary
    $tables = ['partners', 'partner_sessions', 'gym_businesses', 'membership_plans', 'members', 'attendance', 'payments', 'gym_timings', 'reminders'];
    echo "\n=== Database Table Counts ===\n";
    foreach ($tables as $t) {
        $count = $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
        echo " - $t: $count rows\n";
    }

    echo "\nGym Module Database setup complete!\n";
} catch (Exception $e) {
    echo "[ERROR] Database init error: " . $e->getMessage() . "\n";
    exit(1);
}
