<?php
// backend/api/gym/members.php
// List members with search/filters & Add new member

require_once __DIR__ . '/../../middleware/auth.php';

$auth = requireAuth();
$gymId = $auth['gym_id'];

if (!$gymId) {
    jsonError('Gym business not found.', 404);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $search = trim($_GET['q'] ?? $_GET['search'] ?? '');
    $statusFilter = trim($_GET['status'] ?? '');
    $planFilter = trim($_GET['plan_id'] ?? '');

    try {
        $sql = "
            SELECT 
                m.id, m.gym_id, m.name, m.mobile, m.email, m.joining_date, m.status, m.plan_id,
                p.name as plan_name, p.duration as plan_duration, p.fee as plan_fee,
                (SELECT status FROM payments WHERE member_id = m.id ORDER BY payment_date DESC, id DESC LIMIT 1) as last_payment_status,
                (SELECT status FROM attendance WHERE member_id = m.id AND attendance_date = CURDATE() LIMIT 1) as today_attendance,
                (SELECT check_in_time FROM attendance WHERE member_id = m.id AND attendance_date = CURDATE() LIMIT 1) as today_checkin_time
            FROM members m
            LEFT JOIN membership_plans p ON m.plan_id = p.id
            WHERE m.gym_id = :gym_id
        ";
        $params = [':gym_id' => $gymId];

        if (!empty($search)) {
            $sql .= " AND (m.name LIKE :search OR m.mobile LIKE :search OR m.email LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }

        if (!empty($statusFilter) && in_array($statusFilter, ['active', 'inactive'])) {
            $sql .= " AND m.status = :status";
            $params[':status'] = $statusFilter;
        }

        if (!empty($planFilter)) {
            $sql .= " AND m.plan_id = :plan_id";
            $params[':plan_id'] = $planFilter;
        }

        $sql .= " ORDER BY m.id DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $members = $stmt->fetchAll();

        // If status filter is 'due', filter in PHP or subquery
        if ($statusFilter === 'due') {
            $members = array_filter($members, function($m) {
                return in_array($m['last_payment_status'], ['due', 'overdue']);
            });
            $members = array_values($members);
        }

        jsonSuccess([
            'members' => $members,
            'total' => count($members)
        ], 'Members retrieved successfully.');
    } catch (Exception $e) {
        jsonError('Failed to retrieve members: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'POST') {
    $data = getRequestData();

    $name = trim($data['name'] ?? '');
    $mobile = trim($data['mobile'] ?? '');
    $email = trim($data['email'] ?? '');
    $joiningDate = trim($data['joining_date'] ?? date('Y-m-d'));
    $planId = !empty($data['plan_id']) ? (int)$data['plan_id'] : null;
    $status = trim($data['status'] ?? 'active');
    $initialPaymentStatus = trim($data['payment_status'] ?? 'paid'); // 'paid' or 'due'
    $paymentMethod = trim($data['payment_method'] ?? 'UPI');

    if (empty($name)) {
        jsonError('Member name is required.', 422);
    }
    if (empty($mobile)) {
        jsonError('Mobile number is required.', 422);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO members (gym_id, name, mobile, email, joining_date, plan_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$gymId, $name, $mobile, $email, $joiningDate, $planId, $status]);
        $memberId = (int)$pdo->lastInsertId();

        // If plan is selected, create initial payment record
        if ($planId) {
            $stmtPlan = $pdo->prepare("SELECT fee, duration FROM membership_plans WHERE id = ?");
            $stmtPlan->execute([$planId]);
            $plan = $stmtPlan->fetch();

            if ($plan) {
                $fee = (float)$plan['fee'];
                $dueDate = date('Y-m-d', strtotime('+30 days', strtotime($joiningDate)));

                $stmtPay = $pdo->prepare("
                    INSERT INTO payments (member_id, gym_id, plan_id, amount, payment_date, due_date, status, payment_method, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmtPay->execute([
                    $memberId, $gymId, $planId, $fee, $joiningDate, $dueDate,
                    $initialPaymentStatus, $paymentMethod, 'Initial membership payment'
                ]);
            }
        }

        // Fetch newly created member
        $stmtNew = $pdo->prepare("
            SELECT m.*, p.name as plan_name, p.fee as plan_fee, p.duration as plan_duration
            FROM members m
            LEFT JOIN membership_plans p ON m.plan_id = p.id
            WHERE m.id = ?
        ");
        $stmtNew->execute([$memberId]);
        $newMember = $stmtNew->fetch();

        jsonSuccess($newMember, 'Member added successfully.', 201);
    } catch (Exception $e) {
        jsonError('Failed to create member: ' . $e->getMessage(), 500);
    }
} else {
    jsonError('Method not allowed.', 405);
}
