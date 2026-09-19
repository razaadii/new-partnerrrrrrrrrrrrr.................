<?php
// backend/router.php
// Handles CORS and URL routing for PHP Built-in Server

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve static files directly if they exist
$filePath = __DIR__ . $uri;
if (is_file($filePath)) {
    return false;
}

// Remove leading /api if present
$cleanUri = preg_replace('#^/api#', '', $uri);
$cleanUri = trim($cleanUri, '/');

// Default home
if (empty($cleanUri)) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'online',
        'service' => 'SlotB Partner App Backend API (PHP + MySQL)',
        'version' => '1.0.0',
        'default_credentials' => [
            'email' => '123@aadii',
            'password' => '123'
        ],
        'endpoints' => [
            'POST /api/auth/login' => 'Authenticate partner',
            'POST /api/auth/register' => 'Register new partner',
            'GET /api/jobs/list' => 'List jobs (filters: all, active, pending, completed)',
            'POST /api/jobs/accept' => 'Accept a job lead',
            'POST /api/jobs/verify-code' => 'Verify customer PIN',
            'POST /api/jobs/complete' => 'Complete job service',
            'GET /api/earnings' => 'Get wallet & payouts',
            'POST /api/earnings/withdraw' => 'Withdraw from wallet',
            'GET /api/profile' => 'Get partner profile'
        ]
    ], JSON_PRETTY_PRINT);
    exit();
}

// Route mapping
$routes = [
    'auth/login' => __DIR__ . '/auth/login.php',
    'auth/register' => __DIR__ . '/auth/register.php',
    'jobs/list' => __DIR__ . '/jobs/list.php',
    'jobs/accept' => __DIR__ . '/jobs/accept.php',
    'jobs/verify-code' => __DIR__ . '/jobs/verify_code.php',
    'jobs/verify_code' => __DIR__ . '/jobs/verify_code.php',
    'jobs/complete' => __DIR__ . '/jobs/complete.php',
    'earnings' => __DIR__ . '/earnings/get.php',
    'earnings/get' => __DIR__ . '/earnings/get.php',
    'earnings/withdraw' => __DIR__ . '/earnings/withdraw.php',
    'profile' => __DIR__ . '/profile/get.php',
    'profile/get' => __DIR__ . '/profile/get.php'
];

if (isset($routes[$cleanUri]) && file_exists($routes[$cleanUri])) {
    require $routes[$cleanUri];
    exit();
}

// Fallback: Check if direct php file exists
$directFile = __DIR__ . '/' . $cleanUri . '.php';
if (file_exists($directFile)) {
    require $directFile;
    exit();
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode([
    'success' => false,
    'message' => 'API route not found: ' . $uri
]);
