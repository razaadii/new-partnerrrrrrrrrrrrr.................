<?php
// backend/api/auth/me.php
// Returns authenticated partner information

require_once __DIR__ . '/../../middleware/auth.php';

$auth = requireAuth();
$partner = $auth['partner'];
$gym = $auth['gym'];

jsonSuccess([
    'partner' => [
        'id' => (int)$partner['id'],
        'login_id' => $partner['login_id'] ?? $partner['email'],
        'email' => $partner['email'],
        'name' => $partner['name'],
        'mobile' => $partner['mobile'] ?? $partner['phone'],
        'business_type' => $partner['business_type'],
        'category' => $partner['category'],
        'rating' => (float)$partner['rating'],
        'status' => $partner['status'],
        'gym_id' => $gym ? (int)$gym['id'] : null,
        'gym_name' => $gym ? $gym['gym_name'] : null,
        'gym' => $gym
    ]
], 'Profile fetched successfully.');
