<?php
// backend/jobs/accept.php
require_once __DIR__ . '/../config/database.php';

$input = getJsonInput();
$job_id = $input['job_id'] ?? $_POST['job_id'] ?? '';

if (empty($job_id)) {
    sendJsonResponse([
        'success' => false,
        'message' => 'Job ID is required.'
    ], 400);
}

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

    $stmtUpdate = $pdo->prepare("UPDATE jobs SET status = 'active' WHERE id = ?");
    $stmtUpdate->execute([$job_id]);

    sendJsonResponse([
        'success' => true,
        'message' => 'Job accepted successfully! You can now proceed to customer location.',
        'job_id' => $job_id,
        'status' => 'active'
    ]);
} catch (Exception $e) {
    sendJsonResponse([
        'success' => false,
        'message' => 'Failed to accept job: ' . $e->getMessage()
    ], 500);
}
