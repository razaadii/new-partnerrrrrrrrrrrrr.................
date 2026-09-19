<?php
// backend/api/gym/dashboard.php
// Returns comprehensive live metrics, cards, and recent records for Gym Dashboard

require_once __DIR__ . '/../../middleware/auth.php';

$auth = requireAuth();
$gymId = $auth['gym_id'];

if (!$gymId) {
    jsonError('No gym business associated with this partner account.', 404);
}

try {
    // 1. Gym Profile summary
    $stmtGym = $pdo->prepare("SELECT id, gym_name, address, opening_time, closing_time FROM gym_businesses WHERE id = ?");
    $stmtGym->execute([$gymId]);
    $gym = $stmtGym->fetch();

    // 2. Member counts (Total vs Active)
    $stmtMembers = $pdo->prepare("
        SELECT 
            COUNT(*) as total_members,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_members,
            SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_members
        FROM members 
        WHERE gym_id = ?
    ");
    $stmtMembers->execute([$gymId]);
    $memberStats = $stmtMembers->fetch();

    // 3. Today's Attendance
    $stmtAtt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_logged,
            SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_today,
            SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_today
        FROM attendance 
        WHERE gym_id = ? AND attendance_date = CURDATE()
    ");
    $stmtAtt->execute([$gymId]);
    $attStats = $stmtAtt->fetch();

    $presentCount = (int)($attStats['present_today'] ?? 0);
    $totalActiveMembers = (int)($memberStats['active_members'] ?? 0);
    $absentCount = max(0, $totalActiveMembers - $presentCount);
    $attendanceRate = $totalActiveMembers > 0 ? round(($presentCount / $totalActiveMembers) * 100) : 0;

    // 4. Active Plans count
    $stmtPlans = $pdo->prepare("SELECT COUNT(*) FROM membership_plans WHERE gym_id = ? AND status = 'active'");
    $stmtPlans->execute([$gymId]);
    $activePlansCount = (int)$stmtPlans->fetchColumn();

    // 5. Payments metrics (Collected revenue vs Pending dues)
    $stmtPay = $pdo->prepare("
        SELECT 
            SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_collected,
            SUM(CASE WHEN status IN ('due', 'overdue') THEN amount ELSE 0 END) as pending_dues,
            SUM(CASE WHEN status IN ('due', 'overdue') THEN 1 ELSE 0 END) as due_members_count
        FROM payments 
        WHERE gym_id = ?
    ");
    $stmtPay->execute([$gymId]);
    $payStats = $stmtPay->fetch();

    // 6. Recent Members (last 5)
    $stmtRecentMembers = $pdo->prepare("
        SELECT m.id, m.name, m.mobile, m.email, m.joining_date, m.status, p.name as plan_name, p.fee as plan_fee
        FROM members m
        LEFT JOIN membership_plans p ON m.plan_id = p.id
        WHERE m.gym_id = ?
        ORDER BY m.id DESC
        LIMIT 5
    ");
    $stmtRecentMembers->execute([$gymId]);
    $recentMembers = $stmtRecentMembers->fetchAll();

    // 7. Due Members (with pending payments)
    $stmtDueMembers = $pdo->prepare("
        SELECT p.id as payment_id, p.amount, p.due_date, p.status, m.id as member_id, m.name, m.mobile, mp.name as plan_name
        FROM payments p
        JOIN members m ON p.member_id = m.id
        LEFT JOIN membership_plans mp ON p.plan_id = mp.id
        WHERE p.gym_id = ? AND p.status IN ('due', 'overdue')
        ORDER BY p.due_date ASC
        LIMIT 5
    ");
    $stmtDueMembers->execute([$gymId]);
    $dueMembers = $stmtDueMembers->fetchAll();

    // 8. Recent Payments
    $stmtRecentPayments = $pdo->prepare("
        SELECT p.id, p.amount, p.payment_date, p.payment_method, p.status, m.name as member_name, mp.name as plan_name
        FROM payments p
        JOIN members m ON p.member_id = m.id
        LEFT JOIN membership_plans mp ON p.plan_id = mp.id
        WHERE p.gym_id = ?
        ORDER BY p.payment_date DESC, p.id DESC
        LIMIT 5
    ");
    $stmtRecentPayments->execute([$gymId]);
    $recentPayments = $stmtRecentPayments->fetchAll();

    // 9. Quick Actions
    $quickActions = [
        ['id' => 'add_member', 'title' => 'Add Member', 'icon' => 'person-add', 'route' => '/gym/members?action=add'],
        ['id' => 'attendance', 'title' => 'Mark Attendance', 'icon' => 'checkmark-circle', 'route' => '/gym/attendance'],
        ['id' => 'record_payment', 'title' => 'Record Payment', 'icon' => 'card', 'route' => '/gym/payments?action=record'],
        ['id' => 'add_plan', 'title' => 'Membership Plans', 'icon' => 'layers', 'route' => '/gym/plans'],
        ['id' => 'timings', 'title' => 'Manage Slots', 'icon' => 'time', 'route' => '/gym/timings'],
        ['id' => 'profile', 'title' => 'Business Profile', 'icon' => 'business', 'route' => '/gym/profile'],
    ];

    jsonSuccess([
        'gym' => $gym,
        'metrics' => [
            'total_members' => (int)($memberStats['total_members'] ?? 0),
            'active_members' => $totalActiveMembers,
            'inactive_members' => (int)($memberStats['inactive_members'] ?? 0),
            'present_today' => $presentCount,
            'absent_today' => $absentCount,
            'attendance_rate' => $attendanceRate,
            'active_plans' => $activePlansCount,
            'total_collected' => (float)($payStats['total_collected'] ?? 0),
            'pending_dues' => (float)($payStats['pending_dues'] ?? 0),
            'due_members_count' => (int)($payStats['due_members_count'] ?? 0),
        ],
        'recent_members' => $recentMembers,
        'due_members' => $dueMembers,
        'recent_payments' => $recentPayments,
        'quick_actions' => $quickActions
    ], 'Dashboard metrics loaded successfully.');

} catch (Exception $e) {
    jsonError('Failed to load gym dashboard: ' . $e->getMessage(), 500);
}
