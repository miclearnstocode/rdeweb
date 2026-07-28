<?php
// server/cron_send_emails.php
// Called by Bluehost cron job every 10 minutes

// Enable error reporting for debugging
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Log file
$logFile = __DIR__ . '/../logs/email_cron.log';
$logDir = dirname($logFile);

// Create log directory if it doesn't exist
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

// Log function
function logMessage($message) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND);
}

logMessage("=== CRON JOB STARTED ===");

// Make the request to send scheduled emails
$postData = http_build_query([
    'sendScheduledEmails' => '1'
]);

$options = [
    'http' => [
        'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
        'method' => 'POST',
        'content' => $postData,
        'timeout' => 120
    ]
];

$context = stream_context_create($options);

// Use localhost for internal calls
$url = 'http://localhost/server/schedule_emails.php';

$response = file_get_contents($url, false, $context);

if ($response === false) {
    logMessage("ERROR: Failed to connect to schedule_emails.php");
} else {
    logMessage("Response: " . $response);
    
    $data = json_decode($response, true);
    if ($data && isset($data['sent_count'])) {
        logMessage("Sent: {$data['sent_count']}, Failed: {$data['failed_count']}, Pending: {$data['pending_count']}");
    }
}

logMessage("=== CRON JOB COMPLETED ===\n");