<?php
// backend/auth/register.php
require_once __DIR__ . '/../config/database.php';

$input = getJsonInput();

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');
$phone = trim($input['phone'] ?? '');
$category = trim($input['category'] ?? 'AC Technician');

if (empty($name) || empty($email) || empty($password)) {
    sendJsonResponse([
        'success' => false,
        'message' => 'Name, email, and password are required.'
    ], 400);
}

try {
    // Check if email already exists
    $stmtCheck = $pdo->prepare("SELECT id FROM partners WHERE email = ?");
    $stmtCheck->execute([$email]);
    if ($stmtCheck->fetch()) {
        sendJsonResponse([
            'success' => false,
            'message' => 'An account with this email already exists.'
        ], 409);
    }

    $stmtInsert = $pdo->prepare("
        INSERT INTO partners (name, email, password, phone, category, rating, review_count, jobs_completed, months_joined, is_verified, wallet_balance)
        VALUES (?, ?, ?, ?, ?, 5.0, 0, 0, 0, 1, 0.00)
    ");
    $stmtInsert->execute([$name, $email, $password, $phone, $category]);

    $newId = $pdo->lastInsertId();
    $stmtNew = $pdo->prepare("SELECT id, name, email, phone, category, rating, wallet_balance FROM partners WHERE id = ?");
    $stmtNew->execute([$newId]);
    $partner = $stmtNew->fetch();

    sendJsonResponse([
        'success' => true,
        'message' => 'Registration successful! Application approved.',
        'partner' => $partner
    ], 201);
} catch (Exception $e) {
    sendJsonResponse([
        'success' => false,
        'message' => 'Registration failed: ' . $e->getMessage()
    ], 500);
}
