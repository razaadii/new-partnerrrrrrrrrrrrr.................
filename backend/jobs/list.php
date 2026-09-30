<?php
// backend/jobs/list.php
require_once __DIR__ . '/../config/database.php';

$filter = $_GET['filter'] ?? 'all';
$partner_id = isset($_GET['partner_id']) ? (int)$_GET['partner_id'] : null;
$category = $_GET['category'] ?? null;

// Resolve partner_id from Authorization Bearer token if available
$token = null;
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    if (preg_match('/Bearer\s(\S+)/', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
        $token = $matches[1];
    }
}
if ($token && !$partner_id) {
    try {
        $stmtSess = $pdo->prepare("SELECT partner_id FROM partner_sessions WHERE token = ? AND expires_at > NOW() LIMIT 1");
        $stmtSess->execute([$token]);
        $sess = $stmtSess->fetch();
        if ($sess) {
            $partner_id = (int)$sess['partner_id'];
        }
    } catch (Exception $e) {
        // Ignore session lookup failure
    }
}

// Default fallback partner_id
if (!$partner_id && !$category) {
    $partner_id = 1;
}

try {
    $query = "SELECT * FROM jobs WHERE 1=1";
    $params = [];

    if ($partner_id) {
        $query .= " AND partner_id = ?";
        $params[] = $partner_id;
    } elseif ($category) {
        $query .= " AND category LIKE ?";
        $params[] = "%$category%";
    }

    if ($filter !== 'all' && !empty($filter)) {
        $query .= " AND status = ?";
        $params[] = $filter;
    }

    $query .= " ORDER BY id DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

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
