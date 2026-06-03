<?php
// Start output buffering FIRST
ob_start();

// Check if session is already started before starting it
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ===== CRITICAL: Check for UNKNOWN username FIRST - BEFORE ANYTHING ELSE =====
// This runs on EVERY request and immediately destroys invalid sessions
if (isset($_SESSION['userName']) && $_SESSION['userName'] === 'UNKNOWN') {
    // Clear invalid session
    $_SESSION = array();
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
    
    // Redirect to login immediately
    header('Location: /account/Login');
    exit();
}

// Also check for empty or null username
if (!isset($_SESSION['userName']) || empty($_SESSION['userName']) || $_SESSION['userName'] === '') {
    // Don't set UNKNOWN - just redirect if trying to access protected content
    if (!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || 
        strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest') {
        header('Location: /account/Login');
        exit();
    }
}

include ('db.php');

// Set JSON header for AJAX requests
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
    strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    header('Content-Type: application/json');
} else {
    header('Content-Type: application/json');
}

if(isset($_POST['sessionChecker'])){
    $response = new stdClass();
    
    // Check for valid username AND valid login
    $hasValidUsername = isset($_SESSION['userName']) && 
                        $_SESSION['userName'] !== 'UNKNOWN' && 
                        $_SESSION['userName'] !== '' && 
                        $_SESSION['userName'] !== null;
    
    $isValidLogin = isset($_SESSION['login']) && 
                    $_SESSION['login'] === true && 
                    $hasValidUsername;
    
    if($isValidLogin){
        $response->status = false;
        $response->redirect = false;
        $response->message = $_SESSION['userType'] ?? '';
        $response->username = $_SESSION['userName'] ?? '';
        $response->userId = $_SESSION['userId'] ?? '';
    } else {
        $response->status = true;
        $response->redirect = true;
        $response->message = 'Invalid session - please login again';
        $response->redirectUrl = '/account/Login';
        
        // Clear invalid session
        if(isset($_SESSION['login'])) {
            $_SESSION = array();
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params["path"], $params["domain"],
                    $params["secure"], $params["httponly"]
                );
            }
            session_destroy();
        }
    }
    
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}

if(isset($_POST['getUserName'])){
    // NEVER return 'UNKNOWN' - check and redirect instead
    $hasValidUsername = isset($_SESSION['userName']) && 
                        $_SESSION['userName'] !== 'UNKNOWN' && 
                        $_SESSION['userName'] !== '' &&
                        $_SESSION['userName'] !== null;
    
    if($hasValidUsername && isset($_SESSION['login']) && $_SESSION['login'] === true){
        $response = [
            'username' => $_SESSION['userName'],
            'redirect' => false
        ];
    } else {
        // Instead of returning 'UNKNOWN', force redirect
        $response = [
            'username' => '',
            'redirect' => true,
            'redirectUrl' => '/account/Login',
            'message' => 'Session invalid - please login'
        ];
        
        // Clear the invalid session
        if (session_status() === PHP_SESSION_ACTIVE) {
            $_SESSION = array();
            session_destroy();
        }
    }
    
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}

// Default response
ob_clean();
echo json_encode([
    'error' => 'Invalid request',
    'status' => true,
    'redirect' => true,
    'redirectUrl' => '/account/Login',
    'message' => 'Please login to continue'
]);
ob_end_flush();
exit();