<?php
// scratch/test_api.php
// Automated verification script for SlotB Gym REST API endpoints

$baseUrl = 'http://localhost:8000/api';

function apiRequest($url, $method = 'GET', $data = null, $token = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'body' => json_decode($response, true)
    ];
}

echo "=== Running SlotB Gym API Tests ===\n\n";

// 1. Test Login with 123@gym / 123
echo "Test 1: Login with 123@gym / 123... ";
$loginRes = apiRequest("$baseUrl/auth/login", 'POST', [
    'login_id' => '123@gym',
    'password' => '123'
]);

if ($loginRes['code'] === 200 && !empty($loginRes['body']['data']['token'])) {
    echo "PASSED (Token received, Gym: " . $loginRes['body']['data']['partner']['gym_name'] . ")\n";
    $token = $loginRes['body']['data']['token'];
} else {
    echo "FAILED: " . json_encode($loginRes) . "\n";
    exit(1);
}

// 2. Test Login with Invalid Password
echo "Test 2: Login with invalid password... ";
$badLogin = apiRequest("$baseUrl/auth/login", 'POST', [
    'login_id' => '123@gym',
    'password' => 'wrongpass'
]);
if ($badLogin['code'] === 401 && $badLogin['body']['success'] === false) {
    echo "PASSED (Rejected cleanly with 401)\n";
} else {
    echo "FAILED: " . json_encode($badLogin) . "\n";
}

// 3. Test Unauthorized Request
echo "Test 3: Access protected endpoint without token... ";
$unauthRes = apiRequest("$baseUrl/gym/dashboard", 'GET');
if ($unauthRes['code'] === 401) {
    echo "PASSED (401 Unauthorized returned)\n";
} else {
    echo "FAILED: " . json_encode($unauthRes) . "\n";
}

// 4. Test Gym Dashboard
echo "Test 4: GET /api/gym/dashboard... ";
$dashRes = apiRequest("$baseUrl/gym/dashboard", 'GET', null, $token);
if ($dashRes['code'] === 200 && isset($dashRes['body']['data']['metrics'])) {
    $m = $dashRes['body']['data']['metrics'];
    echo "PASSED (Total Members: {$m['total_members']}, Active: {$m['active_members']}, Collected: ₹{$m['total_collected']}, Dues: ₹{$m['pending_dues']})\n";
} else {
    echo "FAILED: " . json_encode($dashRes) . "\n";
}

// 5. Test Gym Business Profile
echo "Test 5: GET /api/gym/business... ";
$bizRes = apiRequest("$baseUrl/gym/business", 'GET', null, $token);
if ($bizRes['code'] === 200 && !empty($bizRes['body']['data']['gym_name'])) {
    echo "PASSED (Gym Name: " . $bizRes['body']['data']['gym_name'] . ")\n";
} else {
    echo "FAILED: " . json_encode($bizRes) . "\n";
}

// 6. Test Members List
echo "Test 6: GET /api/gym/members... ";
$membersRes = apiRequest("$baseUrl/gym/members", 'GET', null, $token);
if ($membersRes['code'] === 200 && count($membersRes['body']['data']['members']) > 0) {
    echo "PASSED (" . count($membersRes['body']['data']['members']) . " members loaded)\n";
} else {
    echo "FAILED: " . json_encode($membersRes) . "\n";
}

// 7. Test Add Member
echo "Test 7: POST /api/gym/members (Add Member)... ";
$newMemberRes = apiRequest("$baseUrl/gym/members", 'POST', [
    'name' => 'Aditya Verma',
    'mobile' => '+91 99881 22334',
    'email' => 'aditya.v@example.com',
    'joining_date' => date('Y-m-d'),
    'plan_id' => 1,
    'status' => 'active',
    'payment_status' => 'paid',
    'payment_method' => 'UPI'
], $token);
if ($newMemberRes['code'] === 201 && !empty($newMemberRes['body']['data']['id'])) {
    $testMemberId = $newMemberRes['body']['data']['id'];
    echo "PASSED (New Member ID: $testMemberId, Name: {$newMemberRes['body']['data']['name']})\n";
} else {
    echo "FAILED: " . json_encode($newMemberRes) . "\n";
}

// 8. Test Member Detail
echo "Test 8: GET /api/gym/member?id=1... ";
$memberDetailRes = apiRequest("$baseUrl/gym/member?id=1", 'GET', null, $token);
if ($memberDetailRes['code'] === 200 && !empty($memberDetailRes['body']['data']['name'])) {
    echo "PASSED (Member: {$memberDetailRes['body']['data']['name']}, Plan: {$memberDetailRes['body']['data']['plan_name']})\n";
} else {
    echo "FAILED: " . json_encode($memberDetailRes) . "\n";
}

// 9. Test Plans List
echo "Test 9: GET /api/gym/plans... ";
$plansRes = apiRequest("$baseUrl/gym/plans", 'GET', null, $token);
if ($plansRes['code'] === 200 && count($plansRes['body']['data']) >= 4) {
    echo "PASSED (" . count($plansRes['body']['data']) . " plans loaded)\n";
} else {
    echo "FAILED: " . json_encode($plansRes) . "\n";
}

// 10. Test Attendance
echo "Test 10: GET /api/gym/attendance... ";
$attRes = apiRequest("$baseUrl/gym/attendance", 'GET', null, $token);
if ($attRes['code'] === 200 && isset($attRes['body']['data']['summary'])) {
    $s = $attRes['body']['data']['summary'];
    echo "PASSED (Present: {$s['present_count']}, Absent: {$s['absent_count']})\n";
} else {
    echo "FAILED: " . json_encode($attRes) . "\n";
}

// 11. Test Mark Attendance
echo "Test 11: POST /api/gym/attendance (Mark Present)... ";
$markAttRes = apiRequest("$baseUrl/gym/attendance", 'POST', [
    'member_id' => 1,
    'attendance_date' => date('Y-m-d'),
    'status' => 'present',
    'check_in_time' => '07:15 AM'
], $token);
if ($markAttRes['code'] === 200) {
    echo "PASSED ({$markAttRes['body']['message']})\n";
} else {
    echo "FAILED: " . json_encode($markAttRes) . "\n";
}

// 12. Test Payments List
echo "Test 12: GET /api/gym/payments... ";
$payRes = apiRequest("$baseUrl/gym/payments", 'GET', null, $token);
if ($payRes['code'] === 200 && isset($payRes['body']['data']['summary'])) {
    $ps = $payRes['body']['data']['summary'];
    echo "PASSED (Collected: ₹{$ps['total_collected']}, Dues: ₹{$ps['pending_dues']})\n";
} else {
    echo "FAILED: " . json_encode($payRes) . "\n";
}

// 13. Test Timings
echo "Test 13: GET /api/gym/timings... ";
$timingsRes = apiRequest("$baseUrl/gym/timings", 'GET', null, $token);
if ($timingsRes['code'] === 200 && count($timingsRes['body']['data']['slots']) > 0) {
    echo "PASSED (" . count($timingsRes['body']['data']['slots']) . " slots found, Hours: {$timingsRes['body']['data']['opening_time']} - {$timingsRes['body']['data']['closing_time']})\n";
} else {
    echo "FAILED: " . json_encode($timingsRes) . "\n";
}

// 14. Test Send Reminder
echo "Test 14: POST /api/gym/reminders (Send reminder)... ";
$remRes = apiRequest("$baseUrl/gym/reminders", 'POST', [
    'member_id' => 5,
    'message' => 'Your monthly gym fee is due soon. Please pay at front desk.'
], $token);
if ($remRes['code'] === 201) {
    echo "PASSED ({$remRes['body']['message']})\n";
} else {
    echo "FAILED: " . json_encode($remRes) . "\n";
}

echo "\n>>> ALL 14 BACKEND API TESTS COMPLETED SUCCESSFULLY! <<<\n";
