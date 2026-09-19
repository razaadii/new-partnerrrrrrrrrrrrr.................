<?php
// backend/earnings/withdraw.php
require_once __DIR__ . '/../config/database.php';

$input = getJsonInput();
$partner_id = $input['partner_id'] ?? 1;
$amount = (float)($input['amount'] ?? 0);

try {
    $stmt = $pdo->prepare("SELECT wallet_balance, bank_name, bank_account FROM partners WHERE id = ?");
    $stmt->execute([$partner_id]);
    $partner = $stmt->fetch();

    if (!$partner) {
        sendJsonResponse([
            'success' => false,
            'message' => 'Partner not found.'
        ], 404);
    }

    $currentBalance = (float)$partner['wallet_balance'];

    // If amount is 0, withdraw all
    if ($amount <= 0 || $amount > $currentBalance) {
        $amount = $currentBalance;
    }

    if ($amount <= 0) {
        sendJsonResponse([
            'success' => false,
            'message' => 'Insufficient wallet balance for payout.'
        ], 400);
    }

    // Deduct from wallet
    $pdo->prepare("UPDATE partners SET wallet_balance = wallet_balance - ? WHERE id = ?")
        ->execute([$amount, $partner_id]);

    // Insert withdrawal transaction
    $txnId = 'TXN-' . rand(1000, 9999);
    $txnTitle = 'Bank Withdrawal • ' . $partner['bank_name'] . ' (' . substr($partner['bank_account'], -4) . ')';
    $pdo->prepare("INSERT INTO transactions (id, partner_id, title, type, amount, status) VALUES (?, ?, ?, 'withdrawal', ?, 'withdrawn')")
        ->execute([$txnId, $partner_id, $txnTitle, $amount]);

    $newBalance = $currentBalance - $amount;

    sendJsonResponse([
        'success' => true,
        'message' => 'Payout of ₹' . number_format($amount, 2) . ' processed to ' . $partner['bank_name'] . ' via Instant IMPS.',
        'transaction_id' => $txnId,
        'amount_withdrawn' => $amount,
        'remaining_wallet_balance' => $newBalance
    ]);
} catch (Exception $e) {
    sendJsonResponse([
        'success' => false,
        'message' => 'Withdrawal failed: ' . $e->getMessage()
    ], 500);
}
