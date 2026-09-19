<?php
// backend/api/gym/timings.php
// Gym Slots and Batches Management

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
            SELECT * FROM gym_timings 
            WHERE gym_id = ? 
            ORDER BY id ASC
        ");
        $stmt->execute([$gymId]);
        $timings = $stmt->fetchAll();

        // Also fetch general opening & closing hours
        $stmtGym = $pdo->prepare("SELECT opening_time, closing_time FROM gym_businesses WHERE id = ?");
        $stmtGym->execute([$gymId]);
        $gymHours = $stmtGym->fetch();

        jsonSuccess([
            'opening_time' => $gymHours['opening_time'] ?? '06:00 AM',
            'closing_time' => $gymHours['closing_time'] ?? '10:00 PM',
            'slots' => $timings
        ], 'Gym timings retrieved.');
    } catch (Exception $e) {
        jsonError('Failed to fetch timings: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'POST') {
    $data = getRequestData();
    $slotId = !empty($_GET['id']) ? (int)$_GET['id'] : (!empty($data['id']) ? (int)$data['id'] : null);

    $label = trim($data['label'] ?? '');
    $startTime = trim($data['start_time'] ?? '');
    $endTime = trim($data['end_time'] ?? '');
    $status = trim($data['status'] ?? 'active');

    if ($slotId) {
        // Update existing slot
        try {
            $stmt = $pdo->prepare("
                UPDATE gym_timings 
                SET label = ?, start_time = ?, end_time = ?, status = ?, updated_at = NOW()
                WHERE id = ? AND gym_id = ?
            ");
            $stmt->execute([$label, $startTime, $endTime, $status, $slotId, $gymId]);

            $stmtFetch = $pdo->prepare("SELECT * FROM gym_timings WHERE id = ?");
            $stmtFetch->execute([$slotId]);
            jsonSuccess($stmtFetch->fetch(), 'Slot timing updated successfully.');
        } catch (Exception $e) {
            jsonError('Failed to update slot: ' . $e->getMessage(), 500);
        }
    } else {
        // Create slot
        if (empty($label) || empty($startTime) || empty($endTime)) {
            jsonError('Slot label, start time, and end time are required.', 422);
        }

        try {
            $stmt = $pdo->prepare("
                INSERT INTO gym_timings (gym_id, label, start_time, end_time, status)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([$gymId, $label, $startTime, $endTime, $status]);
            $newId = (int)$pdo->lastInsertId();

            $stmtFetch = $pdo->prepare("SELECT * FROM gym_timings WHERE id = ?");
            $stmtFetch->execute([$newId]);
            jsonSuccess($stmtFetch->fetch(), 'Slot timing added successfully.', 201);
        } catch (Exception $e) {
            jsonError('Failed to add slot: ' . $e->getMessage(), 500);
        }
    }
} elseif ($method === 'PUT') {
    $data = getRequestData();
    $slotId = !empty($_GET['id']) ? (int)$_GET['id'] : (!empty($data['id']) ? (int)$data['id'] : 0);

    if (!$slotId) {
        jsonError('Slot ID is required.', 400);
    }

    $label = trim($data['label'] ?? '');
    $startTime = trim($data['start_time'] ?? '');
    $endTime = trim($data['end_time'] ?? '');
    $status = trim($data['status'] ?? 'active');

    try {
        $stmt = $pdo->prepare("
            UPDATE gym_timings 
            SET label = ?, start_time = ?, end_time = ?, status = ?, updated_at = NOW()
            WHERE id = ? AND gym_id = ?
        ");
        $stmt->execute([$label, $startTime, $endTime, $status, $slotId, $gymId]);

        $stmtFetch = $pdo->prepare("SELECT * FROM gym_timings WHERE id = ?");
        $stmtFetch->execute([$slotId]);
        jsonSuccess($stmtFetch->fetch(), 'Slot timing updated successfully.');
    } catch (Exception $e) {
        jsonError('Failed to update slot: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'DELETE') {
    $slotId = (int)($_GET['id'] ?? 0);
    if (!$slotId) {
        jsonError('Slot ID is required.', 400);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM gym_timings WHERE id = ? AND gym_id = ?");
        $stmt->execute([$slotId, $gymId]);
        jsonSuccess(null, 'Slot timing removed successfully.');
    } catch (Exception $e) {
        jsonError('Failed to remove slot: ' . $e->getMessage(), 500);
    }
} else {
    jsonError('Method not allowed.', 405);
}
