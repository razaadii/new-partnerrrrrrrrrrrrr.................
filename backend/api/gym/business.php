<?php
// backend/api/gym/business.php
// View and update Gym Business Profile

require_once __DIR__ . '/../../middleware/auth.php';

$auth = requireAuth();
$gymId = $auth['gym_id'];

if (!$gymId) {
    jsonError('Gym profile not found.', 404);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT * FROM gym_businesses WHERE id = ?");
        $stmt->execute([$gymId]);
        $gym = $stmt->fetch();

        if (!$gym) {
            jsonError('Gym business not found.', 404);
        }

        jsonSuccess($gym, 'Gym business details retrieved.');
    } catch (Exception $e) {
        jsonError('Failed to fetch gym business: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'PUT' || $method === 'POST') {
    $data = getRequestData();

    $gymName = trim($data['gym_name'] ?? '');
    $address = trim($data['address'] ?? '');
    $description = trim($data['description'] ?? '');
    $admissionInfo = trim($data['admission_info'] ?? '');
    $openingTime = trim($data['opening_time'] ?? '');
    $closingTime = trim($data['closing_time'] ?? '');
    $latitude = isset($data['latitude']) ? (float)$data['latitude'] : 25.4182;
    $longitude = isset($data['longitude']) ? (float)$data['longitude'] : 86.1272;

    if (empty($gymName) || empty($address)) {
        jsonError('Gym name and address are required.', 422);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE gym_businesses 
            SET gym_name = ?, description = ?, address = ?, latitude = ?, longitude = ?, 
                admission_info = ?, opening_time = ?, closing_time = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([
            $gymName, $description, $address, $latitude, $longitude,
            $admissionInfo, $openingTime, $closingTime, $gymId
        ]);

        $stmtUpdated = $pdo->prepare("SELECT * FROM gym_businesses WHERE id = ?");
        $stmtUpdated->execute([$gymId]);
        $updatedGym = $stmtUpdated->fetch();

        jsonSuccess($updatedGym, 'Gym profile updated successfully.');
    } catch (Exception $e) {
        jsonError('Failed to update gym profile: ' . $e->getMessage(), 500);
    }
} else {
    jsonError('Method not allowed.', 405);
}
