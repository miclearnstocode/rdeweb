<?php
// Start session first before anything else
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Force JSON response for API calls
if (strpos($_SERVER['REQUEST_URI'], '/server/rdeStaff.php') !== false) {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Prevent any accidental output
ob_start();

include_once __DIR__ . '/db.php';
include_once __DIR__ . '/Mailer/mailTemplate.php';
include_once __DIR__ . '/Mailer/MailSender.php';

/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

if (isset($_POST['auth'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = 'no';
    
    // RDE STAFF LOGIN ONLY
    if ($_POST['auth'] === 'login') {
        $usernames = trim($_POST['username']);
        $password = $_POST['password'];
        
        // Validate input
        if (empty($usernames) || empty($password)) {
            $response->message = 'Username and password are required';
            echo json_encode($response);
            ob_end_flush();
            exit();
        }
        
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            if ($con->connect_error) {
                $response->message = 'Database connection failed';
                echo json_encode($response);
                ob_end_flush();
                exit();
            }
            
            $con->set_charset("utf8mb4");
            
            // Query for RDE Staff - FIXED: Removed userType dependency
            $loginUser = "SELECT 
                rdestaff.id,
                rdestaff.username,
                rdestaff.password,
                rdestaff.email
            FROM rdestaff 
            WHERE rdestaff.username = ? 
            LIMIT 1";
            
            if ($statement = $con->prepare($loginUser)) {
                $statement->bind_param("s", $usernames);
                $statement->execute();
                $statement->store_result();
                
                if ($statement->num_rows > 0) {
                    $statement->bind_result(
                        $id, 
                        $userName, 
                        $passWord,
                        $emailAdd
                    );
                    $statement->fetch();
                    
                    // Verify password
                    $passwordMatch = false;
                    if (password_verify($password, $passWord)) {
                        $passwordMatch = true;
                    } elseif ($passWord === $password) {
                        // Legacy plain text support
                        $passwordMatch = true;
                    }
                    
                    if ($passwordMatch) {
                        // Success - RDE Staff authenticated
                        $response->status = true;
                        $response->message = '/rdeOffice/dashboard';
                        
                        // Set session variables for RDE Staff
                        $_SESSION['login'] = true;
                        $_SESSION['userId'] = $id;
                        $_SESSION['userName'] = $userName;
                        $_SESSION['userType'] = 'RDEOFFICE';
                        $_SESSION['userOffice'] = 'RDE OFFICE';
                        $_SESSION['userEmail'] = $emailAdd;
                        $_SESSION['userDesignation'] = 'RDE Staff';
                        
                        // Set isLog session if Auth class exists
                        if (class_exists('Auth')) {
                            $_SESSION['isLog'] = serialize(new Auth(
                                true, 
                                'RDEOFFICE', 
                                $userName, 
                                'RDE OFFICE',
                                $id, 
                                'RDEOFFICE', 
                                $emailAdd, 
                                '', 
                                ''
                            ));
                        }
                        
                        error_log("RDE Staff logged in: $userName");
                        
                    } else {
                        $response->message = 'Invalid password';
                    }
                } else {
                    $response->message = 'Invalid credentials or you are not authorized as RDE Staff';
                }
                $statement->close();
            } else {
                $response->message = 'Database query preparation failed';
                error_log("RDE Staff Auth - Prepare failed: " . $con->error);
            }
            $con->close();
        } else {
            $response->message = 'Failed to connect to database';
        }
        echo json_encode($response);
    }
    
    // LOGOUT
    if (isset($_POST['logout'])) {
        session_destroy();
        echo "/account/Login?";
        ob_end_flush();
        exit();
    }
}

ob_end_flush();
exit();