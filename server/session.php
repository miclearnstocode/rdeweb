<?php
ob_start();

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (isset($_SESSION['userName']) && $_SESSION['userName'] === 'UNKNOWN') {
    $_SESSION = array();
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
    
    header('Location: /account/Login');
    exit();
}

if (!isset($_SESSION['userName']) || empty($_SESSION['userName']) || $_SESSION['userName'] === '') {
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
    } else {
        $response->status = true;
        $response->redirect = true;
        $response->message = 'Invalid session - please login again';
        $response->redirectUrl = '/account/Login';
        
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
        $response = [
            'username' => '',
            'redirect' => true,
            'redirectUrl' => '/account/Login',
            'message' => 'Session invalid - please login'
        ];
        
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