<?php
// backend/api/gym/reminders.php
// Payment due reminders creation and history

require_once __DIR__ . '/../../middleware/auth.php';

$auth = requireAuth();
$gymId = $auth['gym_id'];

if (!$gymId) {
    jsonError('Gym business not found.', 404);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT r.*, m.name as member_name, m.mobile as member_mobile
            FROM reminders r
            JOIN members m ON r.member_id = m.id
            WHERE r.gym_id = ?
            ORDER BY r.created_at DESC, r.id DESC
        ");
        $stmt->execute([$gymId]);
        $reminders = $stmt->fetchAll();

        jsonSuccess($reminders, 'Reminders list retrieved.');
    } catch (Exception $e) {
        jsonError('Failed to fetch reminders: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'POST') {
    $data = getRequestData();

    $memberId = (int)($data['member_id'] ?? 0);
    $customMessage = trim($data['message'] ?? '');
    $type = trim($data['type'] ?? 'payment_due');

    if (!$memberId) {
        jsonError('Member ID is required to send reminder.', 422);
    }

    try {
        $stmtMember = $pdo->prepare("SELECT id, name, mobile FROM members WHERE id = ? AND gym_id = ?");
        $stmtMember->execute([$memberId, $gymId]);
        $member = $stmtMember->fetch();

        if (!$member) {
            jsonError('Member not found.', 404);
        }

        // Auto-generate message if empty
        if (empty($customMessage)) {
            $customMessage = "Dear {$member['name']}, this is a friendly reminder regarding your membership payment at SlotB Fitness. Please complete your fee renewal.";
        }

        $stmtInsert = $pdo->prepare("
            INSERT INTO reminders (gym_id, member_id, type, message, status)
            VALUES (?, ?, ?, ?, 'sent')
        ");
        $stmtInsert->execute([$gymId, $memberId, $type, $customMessage]);
        $newId = (int)$pdo->lastInsertId();

        $stmtFetch = $pdo->prepare("
            SELECT r.*, m.name as member_name, m.mobile as member_mobile
            FROM reminders r
            JOIN members m ON r.member_id = m.id
            WHERE r.id = ?
        ");
        $stmtFetch->execute([$newId]);

        jsonSuccess($stmtFetch->fetch(), "Payment reminder recorded for {$member['name']}.", 201);
    } catch (Exception $e) {
        jsonError('Failed to create reminder: ' . $e->getMessage(), 500);
    }
} else {
    jsonError('Method not allowed.', 405);
}
