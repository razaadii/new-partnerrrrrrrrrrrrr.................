<?php
// backend/middleware/auth.php
// Validates bearer session token and injects authenticated partner + gym context

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

function requireAuth() {
    global $pdo;

    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    $token = '';

    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        $token = $matches[1];
    } elseif (!empty($headers['X-Auth-Token'])) {
        $token = $headers['X-Auth-Token'];
    } elseif (!empty($_GET['token'])) {
        $token = $_GET['token'];
    }

    if (empty($token)) {
        jsonError('Authentication token missing. Please log in.', 401);
    }

    // Lookup session
    try {
        $stmt = $pdo->prepare("
            SELECT s.token, s.expires_at, p.*
            FROM partner_sessions s
            JOIN partners p ON s.partner_id = p.id
            WHERE s.token = ? AND s.expires_at > NOW()
            LIMIT 1
        ");
        $stmt->execute([$token]);
        $partner = $stmt->fetch();

        if (!$partner) {
            jsonError('Invalid or expired session token. Please log in again.', 401);
        }

        // Lookup gym business if gym partner
        $gym = null;
        $gymId = null;
        if ($partner['business_type'] === 'gym') {
            $stmtGym = $pdo->prepare("SELECT * FROM gym_businesses WHERE partner_id = ? LIMIT 1");
            $stmtGym->execute([$partner['id']]);
            $gym = $stmtGym->fetch();
            if ($gym) {
                $gymId = (int)$gym['id'];
            }
        }

        unset($partner['password'], $partner['password_hash']);

        return [
            'partner' => $partner,
            'partner_id' => (int)$partner['id'],
            'gym' => $gym,
            'gym_id' => $gymId
        ];
    } catch (Exception $e) {
        jsonError('Authentication verification failure: ' . $e->getMessage(), 500);
    }
}
