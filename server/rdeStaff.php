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

if (isset($_POST['submitStaff'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = 'Registration failed';
    
    // Get form data
    $staffEmail = isset($_POST['staffEmail']) ? trim($_POST['staffEmail']) : '';
    $staffUserName = isset($_POST['staffUserName']) ? trim($_POST['staffUserName']) : '';
    $staffPassword = isset($_POST['staffPassword']) ? $_POST['staffPassword'] : '';
    
    // Validate inputs
    if (empty($staffEmail) || empty($staffUserName) || empty($staffPassword)) {
        $response->message = 'All fields are required';
        echo json_encode($response);
        ob_end_flush();
        exit();
    }
    
    // Validate email format
    if (!filter_var($staffEmail, FILTER_VALIDATE_EMAIL)) {
        $response->message = 'Invalid email address format';
        echo json_encode($response);
        ob_end_flush();
        exit();
    }
    
    // Validate username (no spaces)
    if (preg_match('/\s/', $staffUserName)) {
        $response->message = 'Username cannot contain spaces';
        echo json_encode($response);
        ob_end_flush();
        exit();
    }
    
    // Validate password length
    if (strlen($staffPassword) < 8) {
        $response->message = 'Password must be at least 8 characters long';
        echo json_encode($response);
        ob_end_flush();
        exit();
    }
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        if ($con->connect_error) {
            $response->message = 'Database connection failed: ' . $con->connect_error;
            echo json_encode($response);
            ob_end_flush();
            exit();
        }
        
        $con->set_charset("utf8mb4");
        
        // Check if username already exists
        $checkStmt = $con->prepare("SELECT id FROM rdestaff WHERE username = ?");
        if ($checkStmt) {
            $checkStmt->bind_param("s", $staffUserName);
            $checkStmt->execute();
            $checkStmt->store_result();
            
            if ($checkStmt->num_rows > 0) {
                $response->message = 'Username already exists. Please choose a different username.';
                $checkStmt->close();
                $con->close();
                echo json_encode($response);
                ob_end_flush();
                exit();
            }
            $checkStmt->close();
        }
        
        // Check if email already exists
        $checkEmailStmt = $con->prepare("SELECT id FROM rdestaff WHERE email = ?");
        if ($checkEmailStmt) {
            $checkEmailStmt->bind_param("s", $staffEmail);
            $checkEmailStmt->execute();
            $checkEmailStmt->store_result();
            
            if ($checkEmailStmt->num_rows > 0) {
                $response->message = 'Email already registered. Please use a different email.';
                $checkEmailStmt->close();
                $con->close();
                echo json_encode($response);
                ob_end_flush();
                exit();
            }
            $checkEmailStmt->close();
        }
        
        // Hash the password
        $hashedPassword = password_hash($staffPassword, PASSWORD_DEFAULT);
        
        // Generate ID (timestamp based)
        $id = round(microtime(true) * 1000);
        
        // Insert new RDE Staff
        $insertStmt = $con->prepare("INSERT INTO rdestaff (id, email, username, password) VALUES (?, ?, ?, ?)");
        if ($insertStmt) {
            $insertStmt->bind_param("ssss", $id, $staffEmail, $staffUserName, $hashedPassword);
            
            if ($insertStmt->execute()) {
                $response->status = true;
                $response->message = 'RDE Staff account successfully registered!';
                
                // Optional: Send email notification
                try {
                    $mailer = new MailSender();
                    $mailer->sendStaffRegistrationEmail($staffEmail, $staffUserName);
                } catch (Exception $e) {
                    // Log error but don't fail the registration
                    error_log("Failed to send registration email: " . $e->getMessage());
                }
                
            } else {
                $response->message = 'Failed to register account: ' . $insertStmt->error;
                error_log("RDE Staff Registration Error: " . $insertStmt->error);
            }
            $insertStmt->close();
        } else {
            $response->message = 'Database query preparation failed: ' . $con->error;
            error_log("RDE Staff Registration - Prepare failed: " . $con->error);
        }
        
        $con->close();
    } else {
        $response->message = 'Failed to connect to database';
    }
    
    // Clear any output buffers and send JSON response
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}

// Clear any output buffers
ob_clean();
ob_end_flush();
exit();