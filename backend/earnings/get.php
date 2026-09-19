<?php
// backend/earnings/get.php
require_once __DIR__ . '/../config/database.php';

$partner_id = $_GET['partner_id'] ?? 1;

try {
    $stmt = $pdo->prepare("SELECT id, name, wallet_balance, bank_name, bank_account, jobs_completed FROM partners WHERE id = ?");
    $stmt->execute([$partner_id]);
    $partner = $stmt->fetch();

    if (!$partner) {
        sendJsonResponse([
            'success' => false,
            'message' => 'Partner not found.'
        ], 404);
    }

    // Fetch transactions
    $stmtTxns = $pdo->prepare("SELECT * FROM transactions WHERE partner_id = ? ORDER BY created_at DESC LIMIT 20");
    $stmtTxns->execute([$partner_id]);
    $txns = $stmtTxns->fetchAll();

    $formattedTxns = array_map(function($t) {
        return [
            'id' => $t['id'],
            'title' => $t['title'],
            'type' => $t['type'],
            'amount' => (float)$t['amount'],
            'status' => $t['status'],
            'date' => date('d M, h:i A', strtotime($t['created_at']))
        ];
    }, $txns);

    $balance = (float)$partner['wallet_balance'];

    sendJsonResponse([
        'success' => true,
        'wallet' => [
            'balance' => $balance,
            'bank_name' => $partner['bank_name'],
            'bank_account' => $partner['bank_account'],
            'is_verified' => true
        ],
        'breakdown' => [
            'today' => [
                'total' => $balance,
                'jobs_completed' => (int)$partner['jobs_completed'],
                'service_revenue' => round($balance * 0.82, 2),
                'incentives' => round($balance * 0.14, 2),
                'tips' => round($balance * 0.04, 2),
                'commission' => 0.00
            ],
            'week' => [
                'total' => round($balance * 6.05, 2),
                'jobs_completed' => 48,
                'service_revenue' => round($balance * 5.1, 2),
                'incentives' => 1800.00,
                'tips' => 570.00,
                'commission' => 0.00
            ],
            'month' => [
                'total' => round($balance * 19.85, 2),
                'jobs_completed' => 156,
                'service_revenue' => round($balance * 17.2, 2),
                'incentives' => 4800.00,
                'tips' => 1750.00,
                'commission' => 0.00
            ]
        ],
        'transactions' => $formattedTxns
    ]);
} catch (Exception $e) {
    sendJsonResponse([
        'success' => false,
        'message' => 'Failed to fetch earnings: ' . $e->getMessage()
    ], 500);
}
