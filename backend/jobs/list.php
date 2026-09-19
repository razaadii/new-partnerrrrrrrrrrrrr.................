<?php
// backend/jobs/list.php
require_once __DIR__ . '/../config/database.php';

$filter = $_GET['filter'] ?? 'all';
$partner_id = $_GET['partner_id'] ?? 1;

try {
    if ($filter === 'all' || empty($filter)) {
        $stmt = $pdo->prepare("SELECT * FROM jobs WHERE partner_id = ? ORDER BY id DESC");
        $stmt->execute([$partner_id]);
    } else {
        $stmt = $pdo->prepare("SELECT * FROM jobs WHERE partner_id = ? AND status = ? ORDER BY id DESC");
        $stmt->execute([$partner_id, $filter]);
    }

    $jobs = $stmt->fetchAll();

    // Map to frontend-friendly fields
    $formattedJobs = array_map(function($job) {
        return [
            'id' => $job['id'],
            'serviceTitle' => $job['service_title'],
            'category' => $job['category'],
            'customerName' => $job['customer_name'],
            'customerPhone' => $job['customer_phone'],
            'location' => $job['customer_address'],
            'scheduledTime' => $job['scheduled_time'],
            'startedAt' => $job['started_at'],
            'amount' => (float)$job['amount'],
            'distance' => $job['distance'],
            'estimatedTime' => $job['estimated_time'],
            'status' => $job['status'],
            'verificationCode' => $job['verification_code'],
            'notes' => $job['notes']
        ];
    }, $jobs);

    // Counts summary
    $stmtCounts = $pdo->prepare("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
        FROM jobs WHERE partner_id = ?
    ");
    $stmtCounts->execute([$partner_id]);
    $counts = $stmtCounts->fetch();

    sendJsonResponse([
        'success' => true,
        'count' => count($formattedJobs),
        'summary' => [
            'total' => (int)$counts['total'],
            'active' => (int)$counts['active_count'],
            'pending' => (int)$counts['pending_count'],
            'completed' => (int)$counts['completed_count']
        ],
        'jobs' => $formattedJobs
    ]);
} catch (Exception $e) {
    sendJsonResponse([
        'success' => false,
        'message' => 'Failed to fetch jobs: ' . $e->getMessage()
    ], 500);
}
