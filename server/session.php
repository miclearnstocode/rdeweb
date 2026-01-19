<?php
// Start output buffering FIRST to catch any notices/warnings
ob_start();

// Check if session is already started before starting it
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include ('db.php');

/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

// Set JSON header
header('Content-Type: application/json');
$response = new stdClass();


if(isset($_POST['sessionChecker'])){
    // FIXED: Check login status correctly this cause that the user is not logged in but the session is still active. so when using OR condition we need to check if the session is still active. So use AND condition instead of OR condition.
    if(isset($_SESSION['login']) && $_SESSION['login'] === true){
        // User IS logged in - don't redirect
        $response->status = false;  // false = don't redirect
        $response->message = $_SESSION['userType'] ?? '';
        $response->username = $_SESSION['userName'] ?? '';
        $response->userId = $_SESSION['userId'] ?? '';
    } else {
        // User is NOT logged in - redirect to login
        $response->status = true;  // true = redirect to login
        $response->message = 'Not logged in';
        $response->sessionId = session_id();
    }
    
    // Clear buffer and output JSON
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}

if(isset($_POST['getUser'])){
    ob_clean();
    echo json_encode([
        'designation' => $_SESSION['userDesignation'] ?? 'UNKNOWN'
    ]);
    ob_end_flush();
    exit();
}

if(isset($_POST['getUserName'])){
    ob_clean();
    echo json_encode([
        'username' => $_SESSION['userName'] ?? 'UNKNOWN'
    ]);
    ob_end_flush();
    exit();
}

// Default response if no valid POST data
ob_clean();
echo json_encode([
    'error' => 'Invalid request',
    'status' => false
]);
ob_end_flush();
exit();