<?php
// backend/api/gym/member.php
// Single member details with payment and attendance history, Edit, and Deactivate

require_once __DIR__ . '/../../middleware/auth.php';

$auth = requireAuth();
$gymId = $auth['gym_id'];

if (!$gymId) {
    jsonError('Gym business not found.', 404);
}

$memberId = (int)($_GET['id'] ?? 0);
if (!$memberId) {
    jsonError('Member ID is required.', 400);
}

$method = $_SERVER['REQUEST_METHOD'];

// Ensure member belongs to this gym
$stmtCheck = $pdo->prepare("SELECT * FROM members WHERE id = ? AND gym_id = ?");
$stmtCheck->execute([$memberId, $gymId]);
$member = $stmtCheck->fetch();

if (!$member) {
    jsonError('Member not found or access denied.', 404);
}

if ($method === 'GET') {
    try {
        // Plan info
        $plan = null;
        if (!empty($member['plan_id'])) {
            $stmtPlan = $pdo->prepare("SELECT * FROM membership_plans WHERE id = ?");
            $stmtPlan->execute([$member['plan_id']]);
            $plan = $stmtPlan->fetch();
        }

        // Payment history
        $stmtPayments = $pdo->prepare("
            SELECT p.*, mp.name as plan_name 
            FROM payments p
            LEFT JOIN membership_plans mp ON p.plan_id = mp.id
            WHERE p.member_id = ? AND p.gym_id = ?
            ORDER BY p.payment_date DESC, p.id DESC
        ");
        $stmtPayments->execute([$memberId, $gymId]);
        $payments = $stmtPayments->fetchAll();

        // Attendance history (last 30 records)
        $stmtAtt = $pdo->prepare("
            SELECT * FROM attendance 
            WHERE member_id = ? AND gym_id = ?
            ORDER BY attendance_date DESC
            LIMIT 30
        ");
        $stmtAtt->execute([$memberId, $gymId]);
        $attendance = $stmtAtt->fetchAll();

        // Attendance summary stats
        $stmtAttSummary = $pdo->prepare("
            SELECT 
                COUNT(*) as total_days,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days
            FROM attendance 
            WHERE member_id = ? AND gym_id = ?
        ");
        $stmtAttSummary->execute([$memberId, $gymId]);
        $attSummary = $stmtAttSummary->fetch();

        $memberData = array_merge($member, [
            'plan' => $plan,
            'plan_name' => $plan ? $plan['name'] : null,
            'plan_fee' => $plan ? $plan['fee'] : null,
            'plan_duration' => $plan ? $plan['duration'] : null,
            'payments' => $payments,
            'attendance' => $attendance,
            'attendance_summary' => [
                'total_logged' => (int)($attSummary['total_days'] ?? 0),
                'present_days' => (int)($attSummary['present_days'] ?? 0),
                'absent_days' => (int)($attSummary['absent_days'] ?? 0),
            ]
        ]);

        jsonSuccess($memberData, 'Member profile loaded successfully.');
    } catch (Exception $e) {
        jsonError('Failed to fetch member details: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'PUT' || $method === 'POST') {
    $data = getRequestData();

    $name = trim($data['name'] ?? $member['name']);
    $mobile = trim($data['mobile'] ?? $member['mobile']);
    $email = trim($data['email'] ?? $member['email']);
    $joiningDate = trim($data['joining_date'] ?? $member['joining_date']);
    $planId = isset($data['plan_id']) ? (!empty($data['plan_id']) ? (int)$data['plan_id'] : null) : $member['plan_id'];
    $status = trim($data['status'] ?? $member['status']);

    if (empty($name) || empty($mobile)) {
        jsonError('Name and mobile number cannot be empty.', 422);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE members 
            SET name = ?, mobile = ?, email = ?, joining_date = ?, plan_id = ?, status = ?, updated_at = NOW()
            WHERE id = ? AND gym_id = ?
        ");
        $stmt->execute([$name, $mobile, $email, $joiningDate, $planId, $status, $memberId, $gymId]);

        $stmtFetch = $pdo->prepare("
            SELECT m.*, p.name as plan_name, p.fee as plan_fee, p.duration as plan_duration
            FROM members m
            LEFT JOIN membership_plans p ON m.plan_id = p.id
            WHERE m.id = ?
        ");
        $stmtFetch->execute([$memberId]);
        $updated = $stmtFetch->fetch();

        jsonSuccess($updated, 'Member updated successfully.');
    } catch (Exception $e) {
        jsonError('Failed to update member: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'DELETE') {
    try {
        // Soft deactivate member or delete
        $action = $_GET['action'] ?? 'deactivate';
        if ($action === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM members WHERE id = ? AND gym_id = ?");
            $stmt->execute([$memberId, $gymId]);
            jsonSuccess(null, 'Member deleted successfully.');
        } else {
            $stmt = $pdo->prepare("UPDATE members SET status = 'inactive', updated_at = NOW() WHERE id = ? AND gym_id = ?");
            $stmt->execute([$memberId, $gymId]);
            jsonSuccess(null, 'Member deactivated successfully.');
        }
    } catch (Exception $e) {
        jsonError('Failed to process delete/deactivate: ' . $e->getMessage(), 500);
    }
} else {
    jsonError('Method not allowed.', 405);
}
