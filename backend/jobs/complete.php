<?php
// backend/jobs/complete.php
require_once __DIR__ . '/../config/database.php';

$input = getJsonInput();
$job_id = $input['job_id'] ?? 'AC1254';
$partner_id = $input['partner_id'] ?? 1;
$notes = trim($input['notes'] ?? '');
$status = $input['status'] ?? 'completed'; // 'completed' or 'not_completed'

try {
    $stmt = $pdo->prepare("SELECT * FROM jobs WHERE id = ?");
    $stmt->execute([$job_id]);
    $job = $stmt->fetch();

    if (!$job) {
        sendJsonResponse([
            'success' => false,
            'message' => 'Job not found.'
        ], 404);
    }

    if ($status === 'completed') {
        // 1. Update job to completed
        $stmtUpdate = $pdo->prepare("UPDATE jobs SET status = 'completed', notes = ? WHERE id = ?");
        $stmtUpdate->execute([$notes, $job_id]);

        // 2. Credit amount to partner wallet
        $amount = (float)$job['amount'];
        $pdo->prepare("UPDATE partners SET wallet_balance = wallet_balance + ?, jobs_completed = jobs_completed + 1 WHERE id = ?")
            ->execute([$amount, $partner_id]);

        // 3. Log transaction
        $txnId = 'TXN-' . rand(1000, 9999);
        $txnTitle = $job['service_title'] . ' • ' . $job['customer_name'];
        $pdo->prepare("INSERT INTO transactions (id, partner_id, title, type, amount, status) VALUES (?, ?, ?, 'job', ?, 'credited')")
            ->execute([$txnId, $partner_id, $txnTitle, $amount]);

        // Fetch updated wallet balance
        $partner = $pdo->query("SELECT wallet_balance, jobs_completed FROM partners WHERE id = $partner_id")->fetch();

        sendJsonResponse([
            'success' => true,
            'message' => 'Job completed successfully! ₹' . number_format($amount, 2) . ' credited to your wallet.',
            'job_id' => $job_id,
            'credited_amount' => $amount,
            'new_wallet_balance' => (float)$partner['wallet_balance'],
            'total_jobs_completed' => (int)$partner['jobs_completed']
        ]);
    } else {
        // Mark as not completed
        $stmtUpdate = $pdo->prepare("UPDATE jobs SET status = 'pending', notes = ? WHERE id = ?");
        $stmtUpdate->execute(['Job marked as not completed: ' . $notes, $job_id]);

        sendJsonResponse([
            'success' => true,
            'message' => 'Job marked as not completed. Our support team will review.',
            'job_id' => $job_id
        ]);
    }
} catch (Exception $e) {
    sendJsonResponse([
        'success' => false,
        'message' => 'Failed to complete job: ' . $e->getMessage()
    ], 500);
}
