<?php
// backend/profile/get.php
require_once __DIR__ . '/../config/database.php';

$partner_id = $_GET['partner_id'] ?? 1;

try {
    $stmt = $pdo->prepare("SELECT id, name, email, phone, category, rating, review_count, jobs_completed, months_joined, is_verified, wallet_balance, bank_name, bank_account FROM partners WHERE id = ?");
    $stmt->execute([$partner_id]);
    $partner = $stmt->fetch();

    if (!$partner) {
        sendJsonResponse([
            'success' => false,
            'message' => 'Partner not found.'
        ], 404);
    }

    sendJsonResponse([
        'success' => true,
        'partner' => [
            'id' => $partner['id'],
            'name' => $partner['name'],
            'email' => $partner['email'],
            'phone' => $partner['phone'],
            'category' => $partner['category'],
            'rating' => (float)$partner['rating'],
            'reviewCount' => (int)$partner['review_count'],
            'jobsCompleted' => (int)$partner['jobs_completed'],
            'monthsJoined' => (int)$partner['months_joined'],
            'isVerified' => (bool)$partner['is_verified'],
            'walletBalance' => (float)$partner['wallet_balance'],
            'bankName' => $partner['bank_name'],
            'bankAccount' => $partner['bank_account']
        ]
    ]);
} catch (Exception $e) {
    sendJsonResponse([
        'success' => false,
        'message' => 'Failed to fetch profile: ' . $e->getMessage()
    ], 500);
}
