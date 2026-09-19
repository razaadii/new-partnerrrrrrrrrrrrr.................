<?php
// backend/api/auth/login.php
// Production-ready authentication endpoint for SlotB Gym & Service Partners

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed. Use POST.', 405);
}

$input = getRequestData();
$loginInput = trim($input['login_id'] ?? $input['email'] ?? $input['id'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($loginInput) || empty($password)) {
    jsonError('Please provide your login ID / email and password.', 400);
}

try {
    // 1. Find partner by login_id OR email
    $stmt = $pdo->prepare("
        SELECT * FROM partners 
        WHERE (login_id IS NOT NULL AND login_id = ?) 
           OR email = ? 
        LIMIT 1
    ");
    $stmt->execute([$loginInput, $loginInput]);
    $partner = $stmt->fetch();

    if (!$partner) {
        jsonError('Invalid Gym ID or password.', 401);
    }

    // 2. Verify password securely using password_verify()
    $hashToCheck = !empty($partner['password_hash']) ? $partner['password_hash'] : $partner['password'];
    $isValid = false;

    if (password_verify($password, $hashToCheck)) {
        $isValid = true;
    } elseif ($password === $partner['password']) {
        // Automatically upgrade plaintext password to bcrypt hash
        $isValid = true;
        $newHash = password_hash($password, PASSWORD_BCRYPT);
        $pdo->prepare("UPDATE partners SET password = ?, password_hash = ? WHERE id = ?")
            ->execute([$newHash, $newHash, $partner['id']]);
    }

    if (!$isValid) {
        jsonError('Invalid Gym ID or password.', 401);
    }

    // 3. Issue secure random 64-character token
    $token = bin2hex(random_bytes(32));
    $stmtSession = $pdo->prepare("
        INSERT INTO partner_sessions (partner_id, token, expires_at)
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))
    ");
    $stmtSession->execute([$partner['id'], $token]);

    // 4. Fetch associated Gym business details if gym partner
    $gym = null;
    if ($partner['business_type'] === 'gym') {
        $stmtGym = $pdo->prepare("SELECT * FROM gym_businesses WHERE partner_id = ? LIMIT 1");
        $stmtGym->execute([$partner['id']]);
        $gym = $stmtGym->fetch();
    }

    // Remove sensitive password fields
    unset($partner['password'], $partner['password_hash']);

    // Build rich partner profile for frontend
    $partnerData = [
        'id' => (int)$partner['id'],
        'login_id' => $partner['login_id'] ?? $partner['email'],
        'email' => $partner['email'],
        'name' => $partner['name'],
        'mobile' => $partner['mobile'] ?? $partner['phone'],
        'business_type' => $partner['business_type'] ?? 'gym',
        'rating' => (float)($partner['rating'] ?? 4.9),
        'status' => $partner['status'] ?? 'active',
        'gym_id' => $gym ? (int)$gym['id'] : null,
        'gym_name' => $gym ? $gym['gym_name'] : null,
        'gym' => $gym
    ];

    jsonSuccess([
        'token' => $token,
        'partner' => $partnerData
    ], 'Login successful! Welcome back, ' . $partner['name']);

} catch (Exception $e) {
    jsonError('Authentication error: ' . $e->getMessage(), 500);
}
