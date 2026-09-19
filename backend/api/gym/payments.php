<?php
// backend/api/gym/payments.php
// Payment and Dues records management

require_once __DIR__ . '/../../middleware/auth.php';

$auth = requireAuth();
$gymId = $auth['gym_id'];

if (!$gymId) {
    jsonError('Gym business not found.', 404);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $statusFilter = trim($_GET['status'] ?? 'all');
    $search = trim($_GET['search'] ?? $_GET['q'] ?? '');

    try {
        // Summary metrics
        $stmtStats = $pdo->prepare("
            SELECT 
                SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_collected,
                SUM(CASE WHEN status IN ('due', 'overdue') THEN amount ELSE 0 END) as pending_dues,
                SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
                SUM(CASE WHEN status IN ('due', 'overdue') THEN 1 ELSE 0 END) as due_count
            FROM payments 
            WHERE gym_id = ?
        ");
        $stmtStats->execute([$gymId]);
        $stats = $stmtStats->fetch();

        // Payment list query
        $sql = "
            SELECT 
                p.*,
                m.name as member_name,
                m.mobile as member_mobile,
                mp.name as plan_name
            FROM payments p
            JOIN members m ON p.member_id = m.id
            LEFT JOIN membership_plans mp ON p.plan_id = mp.id
            WHERE p.gym_id = :gym_id
        ";
        $params = [':gym_id' => $gymId];

        if ($statusFilter === 'paid') {
            $sql .= " AND p.status = 'paid'";
        } elseif ($statusFilter === 'due') {
            $sql .= " AND p.status IN ('due', 'overdue')";
        }

        if (!empty($search)) {
            $sql .= " AND (m.name LIKE :search OR m.mobile LIKE :search OR p.notes LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }

        $sql .= " ORDER BY (CASE WHEN p.status IN ('due', 'overdue') THEN 0 ELSE 1 END), p.due_date ASC, p.payment_date DESC, p.id DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $payments = $stmt->fetchAll();

        jsonSuccess([
            'summary' => [
                'total_collected' => (float)($stats['total_collected'] ?? 0),
                'pending_dues' => (float)($stats['pending_dues'] ?? 0),
                'paid_count' => (int)($stats['paid_count'] ?? 0),
                'due_count' => (int)($stats['due_count'] ?? 0),
            ],
            'payments' => $payments
        ], 'Payments retrieved successfully.');
    } catch (Exception $e) {
        jsonError('Failed to fetch payments: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'POST') {
    $data = getRequestData();

    $memberId = (int)($data['member_id'] ?? 0);
    $planId = !empty($data['plan_id']) ? (int)$data['plan_id'] : null;
    $amount = isset($data['amount']) ? (float)$data['amount'] : 0;
    $paymentDate = trim($data['payment_date'] ?? date('Y-m-d'));
    $dueDate = !empty($data['due_date']) ? trim($data['due_date']) : null;
    $status = trim($data['status'] ?? 'paid');
    $paymentMethod = trim($data['payment_method'] ?? 'UPI');
    $notes = trim($data['notes'] ?? 'Manual payment entry');

    if (!$memberId) {
        jsonError('Member selection is required.', 422);
    }
    if ($amount <= 0) {
        jsonError('Valid amount greater than 0 is required.', 422);
    }

    try {
        // Ensure member exists
        $stmtMember = $pdo->prepare("SELECT id, name, plan_id FROM members WHERE id = ? AND gym_id = ?");
        $stmtMember->execute([$memberId, $gymId]);
        $member = $stmtMember->fetch();

        if (!$member) {
            jsonError('Member not found.', 404);
        }

        if (!$planId && !empty($member['plan_id'])) {
            $planId = (int)$member['plan_id'];
        }

        $stmtInsert = $pdo->prepare("
            INSERT INTO payments (member_id, gym_id, plan_id, amount, payment_date, due_date, status, payment_method, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmtInsert->execute([
            $memberId, $gymId, $planId, $amount, $paymentDate, $dueDate,
            $status, $paymentMethod, $notes
        ]);
        $newId = (int)$pdo->lastInsertId();

        $stmtFetch = $pdo->prepare("
            SELECT p.*, m.name as member_name, mp.name as plan_name
            FROM payments p
            JOIN members m ON p.member_id = m.id
            LEFT JOIN membership_plans mp ON p.plan_id = mp.id
            WHERE p.id = ?
        ");
        $stmtFetch->execute([$newId]);

        jsonSuccess($stmtFetch->fetch(), 'Payment recorded successfully.', 201);
    } catch (Exception $e) {
        jsonError('Failed to record payment: ' . $e->getMessage(), 500);
    }
} else {
    jsonError('Method not allowed.', 405);
}
