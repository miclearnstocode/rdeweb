<?php

// Start session first before anything else
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Force JSON response for API calls
if (strpos($_SERVER['REQUEST_URI'], '/server/researchChairAuth.php') !== false) {
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

include('db.php');

/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
include_once('Mailer/mailTemplate.php');
include_once('Mailer/MailSender.php');

if (isset($_POST['auth'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = 'no';
    
    // RESEARCH CHAIR LOGIN ONLY
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
            // Check connection
            if ($con->connect_error) {
                $response->message = 'Database connection failed';
                echo json_encode($response);
                ob_end_flush();
                exit();
            }
            
            // Set charset to prevent character set injection
            $con->set_charset("utf8mb4");
            
            // Query to get RESEARCH CHAIR users only
            // Research Chairs are identified by having a campus value and usertype containing 'Research Chair'
            $loginUser = "SELECT 
                capsu_user.id,
                capsu_user.username,
                capsu_user.password,
                account_detail.fullName,
                account_detail.campus,
                account_detail.email,    
                account_detail.usertype,
                signature.signature_url,
                signature.scale 
            FROM account_detail
            INNER JOIN capsu_user ON account_detail.id = capsu_user.id
            LEFT JOIN signature ON account_detail.id = signature.user_id 
            WHERE capsu_user.username = ? 
            AND account_detail.campus IS NOT NULL 
            AND account_detail.campus != ''
            AND (account_detail.usertype LIKE '%Research Chair%'
                OR account_detail.usertype LIKE '%research chair%'
                OR account_detail.usertype LIKE '%RESEARCH CHAIR%')
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
                        $fullName, 
                        $campus, 
                        $emailAdd, 
                        $userType, 
                        $signUrl, 
                        $signScale
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
                        // Success - Research Chair authenticated
                        $signature = new stdClass();
                        $signature->url = $signUrl;
                        $signature->scale = $signScale;
                        
                        $response->status = true;
                        $response->message = '/research-chair/submissions';
                        
                        // Set session variables for Research Chair
                        // Use campus instead of center for Research Chairs
                        $_SESSION['isLog'] = serialize(new Auth(
                            true, 
                            $userType, 
                            $userName, 
                            $campus, 
                            $id, 
                            $userType, 
                            $emailAdd, 
                            $fullName, 
                            json_encode($signature)
                        ));
                        $_SESSION['login'] = true;
                        $_SESSION['userId'] = $id;
                        $_SESSION['userName'] = $userName;
                        $_SESSION['userType'] = $userType;
                        $_SESSION['userFulname'] = $fullName;
                        $_SESSION['userEsign'] = json_encode($signature);
                        $_SESSION['userOffice'] = $campus; // Store campus in userOffice
                        $_SESSION['userCenter'] = $campus; // Use campus as center for Research Chairs
                        $_SESSION['userEmail'] = $emailAdd;
                        $_SESSION['userDesignation'] = $userType;
                        $_SESSION['isResearchChair'] = true;
                        $_SESSION['userCampus'] = $campus; // Also store campus separately
                        
                    } else {
                        $response->message = 'Invalid password';
                    }
                } else {
                    // If no results found with the strict query, try a broader search
                    // This is a fallback for cases where usertype might not contain "Research Chair"
                    $fallbackQuery = "SELECT 
                        capsu_user.id,
                        capsu_user.username,
                        capsu_user.password,
                        account_detail.fullName,
                        account_detail.campus,
                        account_detail.email,    
                        account_detail.usertype,
                        signature.signature_url,
                        signature.scale 
                    FROM account_detail
                    INNER JOIN capsu_user ON account_detail.id = capsu_user.id
                    LEFT JOIN signature ON account_detail.id = signature.user_id 
                    WHERE capsu_user.username = ? 
                    AND account_detail.campus IS NOT NULL 
                    AND account_detail.campus != ''
                    AND account_detail.center IS NULL
                    LIMIT 1";
                    
                    if ($fallbackStmt = $con->prepare($fallbackQuery)) {
                        $fallbackStmt->bind_param("s", $usernames);
                        $fallbackStmt->execute();
                        $fallbackStmt->store_result();
                        
                        if ($fallbackStmt->num_rows > 0) {
                            $fallbackStmt->bind_result(
                                $id, 
                                $userName, 
                                $passWord, 
                                $fullName, 
                                $campus, 
                                $emailAdd, 
                                $userType, 
                                $signUrl, 
                                $signScale
                            );
                            $fallbackStmt->fetch();
                            
                            // Verify password
                            $passwordMatch = false;
                            if (password_verify($password, $passWord)) {
                                $passwordMatch = true;
                            } elseif ($passWord === $password) {
                                // Legacy plain text support
                                $passwordMatch = true;
                            }
                            
                            if ($passwordMatch) {
                                $signature = new stdClass();
                                $signature->url = $signUrl;
                                $signature->scale = $signScale;
                                
                                $response->status = true;
                                $response->message = '/research-chair/submissions';
                                
                                $_SESSION['isLog'] = serialize(new Auth(
                                    true, 
                                    $userType, 
                                    $userName, 
                                    $campus,
                                    $id, 
                                    $userType, 
                                    $emailAdd, 
                                    $fullName, 
                                    json_encode($signature)
                                ));
                                $_SESSION['login'] = true;
                                $_SESSION['userId'] = $id;
                                $_SESSION['userName'] = $userName;
                                $_SESSION['userType'] = $userType;
                                $_SESSION['userFulname'] = $fullName;
                                $_SESSION['userEsign'] = json_encode($signature);
                                $_SESSION['userOffice'] = $campus;
                                $_SESSION['userCenter'] = $campus;
                                $_SESSION['userEmail'] = $emailAdd;
                                $_SESSION['userDesignation'] = $userType;
                                $_SESSION['isResearchChair'] = true;
                                $_SESSION['userCampus'] = $campus;
                            } else {
                                $response->message = 'Invalid password';
                            }
                        } else {
                            $response->message = 'Invalid credentials or you are not authorized as Research Chair';
                        }
                        $fallbackStmt->close();
                    } else {
                        $response->message = 'Invalid credentials or you are not authorized as Research Chair';
                    }
                }
                $statement->close();
            } else {
                $response->message = 'Database query preparation failed';
                error_log("Research Chair Auth - Prepare failed: " . $con->error);
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