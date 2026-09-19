<?php
// backend/auth/login.php
require_once __DIR__ . '/../config/database.php';

$input = getJsonInput();
$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($email) || empty($password)) {
    sendJsonResponse([
        'success' => false,
        'message' => 'Email and password are required.'
    ], 400);
}

try {
    $stmt = $pdo->prepare("SELECT * FROM partners WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $partner = $stmt->fetch();

    if (!$partner) {
        sendJsonResponse([
            'success' => false,
            'message' => 'Invalid email or password.'
        ], 401);
    }

    // Verify password: check plain text or hash
    $isPasswordValid = ($password === $partner['password']) || password_verify($password, $partner['password']);

    if (!$isPasswordValid) {
        sendJsonResponse([
            'success' => false,
            'message' => 'Invalid email or password.'
        ], 401);
    }

    // Remove password from returned data
    unset($partner['password']);

    // Generate a simple auth token
    $token = base64_encode($partner['id'] . ':' . time() . ':' . bin2hex(random_bytes(16)));

    sendJsonResponse([
        'success' => true,
        'message' => 'Login successful! Welcome back, ' . $partner['name'],
        'token' => $token,
        'partner' => $partner
    ]);
} catch (Exception $e) {
    sendJsonResponse([
        'success' => false,
        'message' => 'Login error: ' . $e->getMessage()
    ], 500);
}
