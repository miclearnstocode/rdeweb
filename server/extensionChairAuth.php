<?php

// Start session first before anything else
if (session_status() === PHP_SESSION_NONE) {
    session_start();
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
    
    // EXTENSION CHAIR LOGIN ONLY
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
            
            // Set charset to prevent character set injection
            $con->set_charset("utf8mb4");
            
            // Query for Extension Chair with dynamic campus in usertype
            // Pattern: {any campus name} Extension Chair
            $loginUser = "SELECT 
                capsu_user.id,
                capsu_user.username,
                capsu_user.password,
                account_detail.fullName,
                account_detail.center,
                account_detail.campus,
                account_detail.email,    
                account_detail.usertype,
                signature.signature_url,
                signature.scale 
            FROM account_detail
            INNER JOIN capsu_user ON account_detail.id = capsu_user.id
            LEFT JOIN signature ON account_detail.id = signature.user_id 
            WHERE capsu_user.username = ? 
            AND (account_detail.center = 'Extension' OR account_detail.center = 'Extension (Extension)')
            AND account_detail.campus IS NOT NULL 
            AND account_detail.campus != ''
            AND account_detail.usertype LIKE '%Extension Chair%'
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
                        $center, 
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
                        // Extract campus from usertype (e.g., "Roxas City Main Extension Chair" -> "Roxas City Main")
                        $extractedCampus = str_replace(' Extension Chair', '', $userType);
                        $extractedCampus = str_replace('extension chair', '', $extractedCampus);
                        $extractedCampus = trim($extractedCampus);
                        
                        // Use the campus from database if available, otherwise use extracted campus
                        $userCampus = !empty($campus) ? $campus : $extractedCampus;
                        
                        // Success - Extension Chair authenticated
                        $signature = new stdClass();
                        $signature->url = $signUrl;
                        $signature->scale = $signScale;
                        
                        $response->status = true;
                        $response->message = '/extension-chair/submittedDocs/submittedFiles';
                        
                        // Set session variables for Extension Chair
                        $_SESSION['isLog'] = serialize(new Auth(
                            true, 
                            $userType, 
                            $userName, 
                            $center,  // 'Extension' or 'Extension (Extension)'
                            $id, 
                            $userType, 
                            $emailAdd, 
                            $fullName, 
                            json_encode($signature)
                        ));
                        $_SESSION['login'] = true;
                        $_SESSION['userId'] = $id;
                        $_SESSION['userName'] = $userName;
                        $_SESSION['userType'] = 'EXTENSION_CHAIR';  // Set as constant type for system use
                        $_SESSION['userDisplayType'] = $userType;   // Store original display type (e.g., "Roxas City Main Extension Chair")
                        $_SESSION['userFulname'] = $fullName;
                        $_SESSION['userEsign'] = json_encode($signature);
                        $_SESSION['userOffice'] = $center;  // Store center (Extension)
                        $_SESSION['userCenter'] = $center;   // 'Extension' or 'Extension (Extension)'
                        $_SESSION['userEmail'] = $emailAdd;
                        $_SESSION['userDesignation'] = $userType;
                        $_SESSION['isExtensionChair'] = true;  // Flag for Extension Chair
                        $_SESSION['userCampus'] = $userCampus;     // Store specific campus (e.g., 'Roxas City Main')
                        
                        error_log("Extension Chair logged in: $userName (Campus: $userCampus, Center: $center, Type: $userType)");
                        
                    } else {
                        $response->message = 'Invalid password';
                    }
                } else {
                    // Fallback query - just check for center = Extension and usertype contains Extension Chair
                    $fallbackQuery = "SELECT 
                        capsu_user.id,
                        capsu_user.username,
                        capsu_user.password,
                        account_detail.fullName,
                        account_detail.center,
                        account_detail.campus,
                        account_detail.email,    
                        account_detail.usertype,
                        signature.signature_url,
                        signature.scale 
                    FROM account_detail
                    INNER JOIN capsu_user ON account_detail.id = capsu_user.id
                    LEFT JOIN signature ON account_detail.id = signature.user_id 
                    WHERE capsu_user.username = ? 
                    AND (account_detail.center = 'Extension' OR account_detail.center = 'Extension (Extension)')
                    AND account_detail.usertype LIKE '%Extension Chair%'
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
                                $center, 
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
                                $passwordMatch = true;
                            }
                            
                            if ($passwordMatch) {
                                // Extract campus from usertype
                                $extractedCampus = str_replace(' Extension Chair', '', $userType);
                                $extractedCampus = str_replace('extension chair', '', $extractedCampus);
                                $extractedCampus = trim($extractedCampus);
                                
                                $userCampus = !empty($campus) ? $campus : $extractedCampus;
                                
                                $signature = new stdClass();
                                $signature->url = $signUrl;
                                $signature->scale = $signScale;
                                
                                $response->status = true;
                                $response->message = '/extension-chair/submittedDocs/submittedFiles';
                                
                                $_SESSION['isLog'] = serialize(new Auth(
                                    true, 
                                    $userType, 
                                    $userName, 
                                    $center,
                                    $id, 
                                    $userType, 
                                    $emailAdd, 
                                    $fullName, 
                                    json_encode($signature)
                                ));
                                $_SESSION['login'] = true;
                                $_SESSION['userId'] = $id;
                                $_SESSION['userName'] = $userName;
                                $_SESSION['userType'] = 'EXTENSION_CHAIR';
                                $_SESSION['userDisplayType'] = $userType;
                                $_SESSION['userFulname'] = $fullName;
                                $_SESSION['userEsign'] = json_encode($signature);
                                $_SESSION['userOffice'] = $center;
                                $_SESSION['userCenter'] = $center;
                                $_SESSION['userEmail'] = $emailAdd;
                                $_SESSION['userDesignation'] = $userType;
                                $_SESSION['isExtensionChair'] = true;
                                $_SESSION['userCampus'] = $userCampus;
                                
                                error_log("Extension Chair logged in (fallback): $userName (Campus: $userCampus, Center: $center, Type: $userType)");
                            } else {
                                $response->message = 'Invalid password';
                            }
                        } else {
                            $response->message = 'Invalid credentials or you are not authorized as Extension Chair';
                        }
                        $fallbackStmt->close();
                    } else {
                        $response->message = 'Invalid credentials or you are not authorized as Extension Chair';
                    }
                }
                $statement->close();
            } else {
                $response->message = 'Database query preparation failed';
                error_log("Extension Chair Auth - Prepare failed: " . $con->error);
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