<?php
// backend/api/gym/plans.php
// CRUD for Gym Membership Plans

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
            SELECT 
                p.*,
                (SELECT COUNT(*) FROM members WHERE plan_id = p.id AND status = 'active') as active_members_count
            FROM membership_plans p
            WHERE p.gym_id = ?
            ORDER BY p.fee ASC
        ");
        $stmt->execute([$gymId]);
        $plans = $stmt->fetchAll();

        jsonSuccess($plans, 'Membership plans retrieved.');
    } catch (Exception $e) {
        jsonError('Failed to fetch plans: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'POST') {
    $data = getRequestData();

    // Check if this is an update via POST (e.g. if _method=PUT or id is present)
    $planId = !empty($_GET['id']) ? (int)$_GET['id'] : (!empty($data['id']) ? (int)$data['id'] : null);
    $action = $data['_action'] ?? '';

    $name = trim($data['name'] ?? '');
    $duration = trim($data['duration'] ?? '');
    $fee = isset($data['fee']) ? (float)$data['fee'] : 0;
    $status = trim($data['status'] ?? 'active');

    if ($planId && $action !== 'create') {
        // Update existing plan
        try {
            $stmt = $pdo->prepare("
                UPDATE membership_plans 
                SET name = ?, duration = ?, fee = ?, status = ?, updated_at = NOW()
                WHERE id = ? AND gym_id = ?
            ");
            $stmt->execute([$name, $duration, $fee, $status, $planId, $gymId]);

            $stmtFetch = $pdo->prepare("SELECT * FROM membership_plans WHERE id = ?");
            $stmtFetch->execute([$planId]);
            jsonSuccess($stmtFetch->fetch(), 'Plan updated successfully.');
        } catch (Exception $e) {
            jsonError('Failed to update plan: ' . $e->getMessage(), 500);
        }
    } else {
        // Create new plan
        if (empty($name) || empty($duration) || $fee <= 0) {
            jsonError('Plan name, duration, and a valid fee are required.', 422);
        }

        try {
            $stmt = $pdo->prepare("
                INSERT INTO membership_plans (gym_id, name, duration, fee, status)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([$gymId, $name, $duration, $fee, $status]);
            $newId = (int)$pdo->lastInsertId();

            $stmtFetch = $pdo->prepare("SELECT * FROM membership_plans WHERE id = ?");
            $stmtFetch->execute([$newId]);
            jsonSuccess($stmtFetch->fetch(), 'Membership plan created successfully.', 201);
        } catch (Exception $e) {
            jsonError('Failed to create plan: ' . $e->getMessage(), 500);
        }
    }
} elseif ($method === 'PUT') {
    $data = getRequestData();
    $planId = !empty($_GET['id']) ? (int)$_GET['id'] : (!empty($data['id']) ? (int)$data['id'] : 0);

    if (!$planId) {
        jsonError('Plan ID is required.', 400);
    }

    $name = trim($data['name'] ?? '');
    $duration = trim($data['duration'] ?? '');
    $fee = isset($data['fee']) ? (float)$data['fee'] : 0;
    $status = trim($data['status'] ?? 'active');

    try {
        $stmt = $pdo->prepare("
            UPDATE membership_plans 
            SET name = ?, duration = ?, fee = ?, status = ?, updated_at = NOW()
            WHERE id = ? AND gym_id = ?
        ");
        $stmt->execute([$name, $duration, $fee, $status, $planId, $gymId]);

        $stmtFetch = $pdo->prepare("SELECT * FROM membership_plans WHERE id = ?");
        $stmtFetch->execute([$planId]);
        jsonSuccess($stmtFetch->fetch(), 'Plan updated successfully.');
    } catch (Exception $e) {
        jsonError('Failed to update plan: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'DELETE') {
    $planId = (int)($_GET['id'] ?? 0);
    if (!$planId) {
        jsonError('Plan ID is required.', 400);
    }

    try {
        // Toggle status to inactive or delete if no members attached
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM members WHERE plan_id = ?");
        $stmtCheck->execute([$planId]);
        $hasMembers = (int)$stmtCheck->fetchColumn() > 0;

        if ($hasMembers) {
            $stmt = $pdo->prepare("UPDATE membership_plans SET status = 'inactive' WHERE id = ? AND gym_id = ?");
            $stmt->execute([$planId, $gymId]);
            jsonSuccess(null, 'Plan has members assigned. It was deactivated instead of deleted.');
        } else {
            $stmt = $pdo->prepare("DELETE FROM membership_plans WHERE id = ? AND gym_id = ?");
            $stmt->execute([$planId, $gymId]);
            jsonSuccess(null, 'Plan deleted successfully.');
        }
    } catch (Exception $e) {
        jsonError('Failed to delete plan: ' . $e->getMessage(), 500);
    }
} else {
    jsonError('Method not allowed.', 405);
}
