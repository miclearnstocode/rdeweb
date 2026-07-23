<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/drive_errors.log');
// Start session first before anything else
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (isset($_POST['auth']) || strpos($_SERVER['REQUEST_URI'], '/loginAuth') !== false) {
    header('Content-Type: application/json; charset=utf-8');
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
/** @var TYPE_NAME $rdeEmail */
/** @var TYPE_NAME $emailPassword */

require_once __DIR__ . '/Mailer/mailTemplate.php';
require_once __DIR__ . '/Mailer/MailSender.php';

if(isset($_POST['auth'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='no';
    
    if($_POST['auth']==='login'){
        
        $usernames = trim($_POST['username']);
        $password = $_POST['password'];
        
        if($con = new mysqli($host, $username, $pass, $dbName)){
            // Check admin table first
            if($statement = $con->prepare("SELECT admin.id, admin.password FROM admin WHERE admin.username = ?")){
                $statement->bind_param('s', $usernames);
                $statement->execute();
                $statement->store_result();
                
                if($statement->num_rows > 0){
                    $statement->bind_result($id, $pas);
                    $statement->fetch();
                    
                    $passwordMatch = false;
                    if($pas === $password) {
                        $passwordMatch = true;
                    } else if(password_verify($password, $pas)) {
                        $passwordMatch = true;
                    }
                    
                    if($passwordMatch){
                        $response->status = true;
                        $response->message = '/admin/addAccount';
                        
                        $_SESSION['isLog'] = serialize(new Auth(true, 'ADMIN', $usernames, '', $id, '', '', '', ''));
                        $_SESSION['login'] = true;
                        $_SESSION['userId'] = $id;
                        $_SESSION['userName'] = 'ADMIN';
                        $_SESSION['userType'] = 'ADMIN';
                        $_SESSION['userFulname'] = 'ADMIN';
                        $_SESSION['userEsign'] = '';
                        $_SESSION['userOffice'] = 'CENTRAL OFFICE';
                        $_SESSION['userEmail'] = '';
                        
                        echo json_encode($response);
                        ob_end_flush();
                        exit();
                    } else {
                        $response->message = 'Username/Password is incorrect..!';
                        echo json_encode($response);
                        ob_end_flush();
                        exit();
                    }
                }
                $statement->close();
            }
            
            $loginUser = "SELECT 
                capsu_user.id,
                capsu_user.username,
                capsu_user.password,
                account_detail.fullName,
                account_detail.center,
                account_detail.email,    
                account_detail.usertype,
                signature.signature_url,
                signature.scale 
            FROM account_detail
            LEFT JOIN capsu_user ON account_detail.id = capsu_user.id
            LEFT JOIN signature ON account_detail.id = signature.user_id 
            WHERE capsu_user.username = ? 
            AND account_detail.center IS NOT NULL 
            AND account_detail.center != ''";
            
            if($statement = $con->prepare($loginUser)){
                $statement->bind_param("s", $usernames);
                $statement->execute();
                $statement->store_result();
                
                if($statement->num_rows > 0){
                    $statement->bind_result($id, $userName, $passWord, $fullName, $center, $emailAdd, $userType, $signUrl, $signScale);
                    $statement->fetch();
                    
                    if(password_verify($password, $passWord)){
                        $response->status = true;
                        
                        // Determine redirect based on user type
                        $redirectUrl = '/user/research/submittedDocs/submittedFiles'; // Default
                        
                        $signature = new stdClass();
                        $signature->url = $signUrl;
                        $signature->scale = $signScale;
                        
                        // CHECK FOR EXTENSION CHAIR FIRST
                        if(strpos($userType, 'Extension Chair') !== false || strpos($userType, 'extension chair') !== false) {
                            $redirectUrl = '/extension-chair';
                            $_SESSION['isExtensionChair'] = true;
                            $_SESSION['userType'] = 'EXTENSION'; // Override user type
                        }
                        // CHECK FOR RESEARCH CHAIR
                        else if(strpos($userType, 'Research Chair') !== false || strpos($userType, 'research chair') !== false) {
                            $redirectUrl = '/user/research/submittedDocs/submittedFiles';
                            $_SESSION['isResearchChair'] = true;
                            $_SESSION['userType'] = 'CAPSUUSERS';
                        }
                        // CHECK FOR CENTER DIRECTOR
                        else if(strpos($userType, 'Center Director') !== false || strpos($userType, 'center director') !== false) {
                            $redirectUrl = '/user/research/submittedDocs/submittedFiles';
                            $_SESSION['isResearchChair'] = true;
                            $_SESSION['userType'] = 'CAPSUUSERS';
                        }
                        // DEFAULT - CAPSUUSERS (regular researchers)
                        else {
                            $redirectUrl = '/user/research/submittedDocs/submittedFiles';
                            $_SESSION['userType'] = 'CAPSUUSERS';
                        }
                        
                        $response->message = $redirectUrl;
                        
                        $_SESSION['isLog'] = serialize(new Auth(true, $_SESSION['userType'], $userName, $center, $id, $userType, $emailAdd, $fullName, json_encode($signature)));
                        $_SESSION['login'] = true;
                        $_SESSION['userId'] = $id;
                        $_SESSION['userName'] = $userName;
                        $_SESSION['userFulname'] = $fullName;
                        $_SESSION['userEsign'] = json_encode($signature);
                        $_SESSION['userCenter'] = $center;
                        $_SESSION['userEmail'] = $emailAdd;
                        $_SESSION['userDesignation'] = $userType;
                        
                        echo json_encode($response);
                        ob_end_flush();
                        exit();
                    } else {
                        $response->message = 'Password is incorrect';
                        echo json_encode($response);
                        ob_end_flush();
                        exit();
                    }
                }
                $statement->close();
            }
            
            // Check RDE Staff table
            $rdeLogin = "SELECT id, username, password, email FROM rdestaff WHERE username = ?";
            if ($rdeStmt = $con->prepare($rdeLogin)) {
                $rdeStmt->bind_param("s", $usernames);
                $rdeStmt->execute();
                $rdeStmt->store_result();
                
                if ($rdeStmt->num_rows > 0) {
                    $rdeStmt->bind_result($rdeId, $rdeUser, $rdePass, $rdeEmail);
                    $rdeStmt->fetch();
                    
                    if (password_verify($password, $rdePass) || $rdePass === $password) {
                        $response->status = true;
                        $response->message = '/rdeOffice/dashboard';
                        
                        $_SESSION['login'] = true;
                        $_SESSION['userId'] = $rdeId;
                        $_SESSION['userName'] = $rdeUser;
                        $_SESSION['userType'] = 'RDEOFFICE';
                        $_SESSION['userOffice'] = 'RDE OFFICE';
                        $_SESSION['userEmail'] = $rdeEmail;
                        $_SESSION['userDesignation'] = 'RDE Staff';
                        
                        echo json_encode($response);
                        ob_end_flush();
                        exit();
                    }
                }
                $rdeStmt->close();
            }
            
            // If no user found in any table
            $response->message = 'Invalid credentials. Please check your username and password.';
            echo json_encode($response);
            $con->close();
            ob_end_flush();
            exit();
            
        } else {
            $response->message = 'Failed to connect to database';
            echo json_encode($response);
            ob_end_flush();
            exit();
        }
    }

    if($_POST['auth'] === 'signup'){
        $email = $_POST['userEmail'];
        $usernames = $_POST['username'];
        $fullname = $_POST['fullName'];
        $plainPassword = $_POST['password'];
        $password = password_hash($plainPassword, PASSWORD_DEFAULT);
        
        // Determine the center/campus based on what was sent
        $center = null;
        $campus = null;
        $isResearchChair = false;
        $usertype = '';
        
        // Check if cName is provided (Research Center Chair / Extension)
        if(isset($_POST['cName']) && !empty($_POST['cName'])) {
            $center = $_POST['cName'];
            if(isset($_POST['campus']) && !empty($_POST['campus'])) {
                $campus = $_POST['campus'];
                $usertype = $campus . ' Extension Chair';
            } else {
                $usertype = $center . ' Center Director';
            }
        }
        // Check if only campus is provided (Research Chair)
        else if(isset($_POST['campus']) && !empty($_POST['campus'])) {
            $campus = $_POST['campus'];
            $center = $_POST['campus'];
            $isResearchChair = true;
            $usertype = $campus . ' Research Chair';
        }
        else {
            $response->message = "Missing center/campus information!";
            echo json_encode($response);
            ob_end_flush();
            exit();
        }
        
        if($con = new mysqli($host, $username, $pass, $dbName)){
            // Get the next available ID
            $getIdQuery = "SELECT MAX(id) + 1 as next_id FROM account_detail";
            $getIdResult = $con->query($getIdQuery);
            $nextId = $getIdResult->fetch_assoc()['next_id'];
            
            if ($nextId === null) {
                $nextId = 1;
            }
            
            // Insert into account_detail based on user type
            if($isResearchChair) {
                // Research Chair - insert fullName and campus, center is the campus name
                $insertAccount = "INSERT INTO account_detail (id, fullName, center, campus, email, usertype, date) 
                                VALUES (?, ?, ?, ?, ?, ?, NOW())";
                $stmt = $con->prepare($insertAccount);
                $stmt->bind_param("isssss", $nextId, $fullname, $campus, $campus, $email, $usertype);
            } else if($center === 'Extension') {
                // Extension Chair - center is 'Extension', campus is the campus
                $insertAccount = "INSERT INTO account_detail (id, fullName, center, campus, email, usertype, date) 
                                VALUES (?, ?, ?, ?, ?, ?, NOW())";
                $stmt = $con->prepare($insertAccount);
                $stmt->bind_param("isssss", $nextId, $fullname, $center, $campus, $email, $usertype);
            } else {
                // Research Center Chair - center is the center, campus is NULL
                $insertAccount = "INSERT INTO account_detail (id, fullName, center, campus, email, usertype, date) 
                                VALUES (?, ?, ?, NULL, ?, ?, NOW())";
                $stmt = $con->prepare($insertAccount);
                $stmt->bind_param("issss", $nextId, $fullname, $center, $email, $usertype);
            }
            
            if($stmt->execute()){
                // Insert into capsu_user
                $insertUser = "INSERT INTO capsu_user (id, username, password) VALUES (?, ?, ?)";
                $userStmt = $con->prepare($insertUser);
                $userStmt->bind_param("iss", $nextId, $usernames, $password);
                
                if($userStmt->execute()){
                    // Send email
                    $from = new stdClass();
                    $from->email = $rdeEmail;
                    $from->password = $emailPassword;
                    $from->name = 'Research, Development and Extension';
                    
                    $to = new stdClass();
                    $to->name = $fullname;
                    $to->email = $email;
                    
                    $displayLocation = $campus ? $campus : $center;
                    
                    try {
                        $emailContent = Signup($usernames, $plainPassword, $displayLocation);
                        SendEmail($from, $to, $emailContent);
                    } catch (Exception $e) {
                        error_log("Email sending failed: " . $e->getMessage());
                    }
                    
                    $response->status = true;
                    $response->message = "Account created successfully!";
                } else {
                    $response->message = "Failed to create user account: " . $userStmt->error;
                }
            } else {
                $response->message = "Failed to create account: " . $stmt->error;
            }
            
            $con->close();
        } else {
            $response->message = 'Failed to connect to database!';
        }
        echo json_encode($response);
        ob_end_flush();
        exit();
    }
}

if(isset($_POST['logout'])){
    session_destroy();
    echo "/account/Login?";
}

ob_end_flush();
exit();