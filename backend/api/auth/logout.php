<?php
// backend/api/auth/logout.php
// Revokes the current session token

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/response.php';

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
$token = '';

if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
    $token = $matches[1];
} elseif (!empty($headers['X-Auth-Token'])) {
    $token = $headers['X-Auth-Token'];
}

if (!empty($token)) {
    try {
        $stmt = $pdo->prepare("DELETE FROM partner_sessions WHERE token = ?");
        $stmt->execute([$token]);
    } catch (Exception $e) {
        // Silently continue
    }
}

jsonSuccess(null, 'Logged out successfully.');
