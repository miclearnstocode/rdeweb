<?php

// Start session first before anything else
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Force JSON response for API calls
if (strpos($_SERVER['REQUEST_URI'], '/loginAuth') !== false || 
    strpos($_SERVER['REQUEST_URI'], '/server/authToken.php') !== false) {
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
/** @var TYPE_NAME $rdeEmail */
/** @var TYPE_NAME $emailPassword */
include_once('Mailer/mailTemplate.php');
include_once('Mailer/MailSender.php');

if(isset($_POST['auth'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='no';
    
    if($_POST['auth']==='login'){
        
        // FIRST: Check if user is an ADMIN (no userType required)
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
                    
                    // Check password - try both plain text and hashed
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
            
            // If not admin, check for other user types (CAPSUUSERS, Center Directors, etc.)
            // Try to find user in capsu_user with account_detail
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
            AND account_detail.center != ''
            AND (account_detail.campus IS NULL OR account_detail.campus = '')
            AND account_detail.usertype NOT LIKE '%Research Chair%'
            AND account_detail.usertype NOT LIKE '%research chair%'
            AND account_detail.usertype NOT LIKE '%RESEARCH CHAIR%'";
            
            if($statement = $con->prepare($loginUser)){
                $statement->bind_param("s", $usernames);
                $statement->execute();
                $statement->store_result();
                
                if($statement->num_rows > 0){
                    $statement->bind_result($id, $userName, $passWord, $fullName, $center, $emailAdd, $userType, $signUrl, $signScale);
                    $statement->fetch();
                    
                    if(password_verify($password, $passWord)){
                        $response->status = true;
                        $response->message = '/user/research/submittedDocs/submittedFiles';
                        
                        $signature = new stdClass();
                        $signature->url = $signUrl;
                        $signature->scale = $signScale;
                        
                        $_SESSION['isLog'] = serialize(new Auth(true, 'CAPSUUSERS', $userName, $center, $id, $userType, $emailAdd, $fullName, json_encode($signature)));
                        $_SESSION['login'] = true;
                        $_SESSION['userId'] = $id;
                        $_SESSION['userName'] = $userName;
                        $_SESSION['userType'] = 'CAPSUUSERS';
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
            
            // If no user found at all
            $response->message = 'Invalid credentials. Please check your username and password.';
            echo json_encode($response);
            $con->close();
        } else {
            $response->message = 'Failed to connect to database';
            echo json_encode($response);
        }
        
        ob_end_flush();
        exit();
    }

    if($_POST['auth']==='signup'){
        $email = $_POST['userEmail'];
        $usernames = $_POST['username'];
        $fullname = $_POST['fullName'];
        $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
        
        // Determine the center/campus based on what was sent
        $center = null;
        $campus = null;
        $isResearchChair = false;
        
        // Check if cName is provided (Research Center Chair)
        if(isset($_POST['cName']) && !empty($_POST['cName'])) {
            $center = $_POST['cName'];
            if(isset($_POST['campus']) && !empty($_POST['campus'])) {
                $campus = $_POST['campus'];
            }
        }
        // Check if only campus is provided (Research Chair)
        else if(isset($_POST['campus']) && !empty($_POST['campus'])) {
            $campus = $_POST['campus'];
            $center = $_POST['campus'];
            $isResearchChair = true;
        }
        else {
            $response->message = "Missing center/campus information!";
            echo json_encode($response);
            exit();
        }
        
        if($con = new mysqli($host, $username, $pass, $dbName)){
            if($isResearchChair) {
                $response->message = "Research Chair registration should be done through the Research Chair signup page.";
                echo json_encode($response);
                exit();
            } else {
                if($campus) {
                    $checkAccount = "SELECT id, usertype, center, campus FROM account_detail WHERE account_detail.email=? AND account_detail.center=? AND (account_detail.campus=? OR account_detail.campus IS NULL) AND account_detail.usertype NOT LIKE '%Research Chair%'";
                    $checkStmt = $con->prepare($checkAccount);
                    $checkStmt->bind_param('sss', $email, $center, $campus);
                } else {
                    $checkAccount = "SELECT id, usertype, center, campus FROM account_detail WHERE account_detail.email=? AND account_detail.center=? AND (account_detail.campus IS NULL OR account_detail.campus = '') AND account_detail.usertype NOT LIKE '%Research Chair%'";
                    $checkStmt = $con->prepare($checkAccount);
                    $checkStmt->bind_param('ss', $email, $center);
                }
            }
            
            $checkStmt->execute();
            $result = $checkStmt->get_result();
            
            if($result->num_rows > 0){
                $accountData = $result->fetch_assoc();
                $accountId = $accountData['id'];
                $userType = $accountData['usertype'];
                $actualCenter = $accountData['center'];
                
                // Check if username already exists
                $userNameCheck = "SELECT COUNT(*) FROM capsu_user WHERE capsu_user.username=?";
                $userStatmentCheck = $con->prepare($userNameCheck);
                $userStatmentCheck->bind_param("s", $usernames);
                $userStatmentCheck->execute();
                $usRow = $userStatmentCheck->get_result()->fetch_row();
                
                if($usRow[0] === 0){
                    // Check if account already has a user
                    $checkUserExists = "SELECT id FROM capsu_user WHERE id=?";
                    $checkUserStmt = $con->prepare($checkUserExists);
                    $checkUserStmt->bind_param("i", $accountId);
                    $checkUserStmt->execute();
                    $checkUserStmt->store_result();
                    
                    if($checkUserStmt->num_rows === 0){
                        // Insert new user
                        $queryUser = "INSERT INTO capsu_user (id, username, password) VALUES (?, ?, ?)";
                        $stm = $con->prepare($queryUser);
                        $stm->bind_param("iss", $accountId, $usernames, $password);
                        
                        if($stm->execute()){
                            // Update fullName
                            $upDe = "UPDATE account_detail SET account_detail.fullName=? WHERE account_detail.id=?";
                            $state = $con->prepare($upDe);
                            $state->bind_param("si", $fullname, $accountId);
                            
                            if($state->execute()){
                                $from = new stdClass();
                                $from->email = $rdeEmail;
                                $from->password = $emailPassword;
                                $from->name = 'Research, Development and Extension';
                                
                                $to = new stdClass();
                                $to->name = $fullname;
                                $to->email = $email;
                                
                                SendEmail($from, $to, Signup($usernames, $_POST['password'], $actualCenter));
                                
                                $response->status = true;
                                $response->message = "/";
                            } else {
                                $response->message = "Failed to update full name: " . $state->error;
                            }
                        } else {
                            $response->message = "Failed to create user account: " . $stm->error;
                        }
                    } else {
                        $response->message = "This account already has a registered user. Please login.";
                    }
                } else {
                    $response->message = "Username is not available!";
                }
            } else {
                $response->message = "Email address not found for the selected center. Please contact your administrator to create your account first.";
            }
            $con->close();
        } else {
            $response->message = 'Failed to connect to database!';
        }
        echo json_encode($response);
    }
}

if(isset($_POST['logout'])){
    session_destroy();
    echo "/account/Login?";
}

ob_end_flush();
exit();