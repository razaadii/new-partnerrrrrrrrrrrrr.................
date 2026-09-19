<?php
// backend/api/gym/attendance.php
// View attendance by date and Mark present/absent

require_once __DIR__ . '/../../middleware/auth.php';

$auth = requireAuth();
$gymId = $auth['gym_id'];

if (!$gymId) {
    jsonError('Gym business not found.', 404);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $date = trim($_GET['date'] ?? date('Y-m-d'));
    $search = trim($_GET['search'] ?? $_GET['q'] ?? '');

    try {
        // Fetch all active members and join their attendance status for the target date
        $sql = "
            SELECT 
                m.id as member_id,
                m.name as member_name,
                m.mobile as member_mobile,
                m.status as member_status,
                p.name as plan_name,
                a.id as attendance_id,
                COALESCE(a.status, 'absent') as status,
                a.check_in_time,
                a.attendance_date
            FROM members m
            LEFT JOIN membership_plans p ON m.plan_id = p.id
            LEFT JOIN attendance a ON m.id = a.member_id AND a.attendance_date = :date
            WHERE m.gym_id = :gym_id AND m.status = 'active'
        ";
        $params = [
            ':date' => $date,
            ':gym_id' => $gymId
        ];

        if (!empty($search)) {
            $sql .= " AND (m.name LIKE :search OR m.mobile LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }

        $sql .= " ORDER BY (CASE WHEN a.status = 'present' THEN 0 ELSE 1 END), m.name ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $list = $stmt->fetchAll();

        // Calculate counts
        $presentCount = 0;
        $absentCount = 0;
        foreach ($list as $row) {
            if ($row['status'] === 'present') {
                $presentCount++;
            } else {
                $absentCount++;
            }
        }
        $totalMembers = count($list);

        jsonSuccess([
            'date' => $date,
            'summary' => [
                'total_members' => $totalMembers,
                'present_count' => $presentCount,
                'absent_count' => $absentCount,
                'attendance_rate' => $totalMembers > 0 ? round(($presentCount / $totalMembers) * 100) : 0
            ],
            'attendance' => $list
        ], 'Attendance retrieved for ' . $date);
    } catch (Exception $e) {
        jsonError('Failed to fetch attendance: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'POST') {
    $data = getRequestData();

    $memberId = (int)($data['member_id'] ?? 0);
    $attendanceDate = trim($data['attendance_date'] ?? date('Y-m-d'));
    $status = trim($data['status'] ?? 'present'); // 'present' or 'absent'
    $checkInTime = $data['check_in_time'] ?? null;

    if (!$memberId) {
        jsonError('Member ID is required.', 422);
    }

    // Default check in time if present
    if ($status === 'present' && empty($checkInTime)) {
        $checkInTime = date('h:i A');
    } elseif ($status === 'absent') {
        $checkInTime = null;
    }

    try {
        // Ensure member belongs to this gym
        $stmtCheck = $pdo->prepare("SELECT id, name FROM members WHERE id = ? AND gym_id = ?");
        $stmtCheck->execute([$memberId, $gymId]);
        $member = $stmtCheck->fetch();

        if (!$member) {
            jsonError('Member not found in your gym.', 404);
        }

        // Insert or update attendance record (prevents duplicates for same member & date)
        $stmtUpsert = $pdo->prepare("
            INSERT INTO attendance (member_id, gym_id, attendance_date, check_in_time, status)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                check_in_time = VALUES(check_in_time),
                status = VALUES(status)
        ");
        $stmtUpsert->execute([$memberId, $gymId, $attendanceDate, $checkInTime, $status]);

        jsonSuccess([
            'member_id' => $memberId,
            'member_name' => $member['name'],
            'attendance_date' => $attendanceDate,
            'status' => $status,
            'check_in_time' => $checkInTime
        ], "Attendance marked as {$status} for {$member['name']}.");
    } catch (Exception $e) {
        jsonError('Failed to mark attendance: ' . $e->getMessage(), 500);
    }
} else {
    jsonError('Method not allowed.', 405);
}
