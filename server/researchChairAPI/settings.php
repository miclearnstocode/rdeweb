<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../drive_errors.log');

header('Content-Type: application/json; charset=utf-8');

// Start output buffering with callback to catch errors
ob_start(function ($buffer) {
    if (
        strpos($buffer, '<b>Warning</b>') !== false ||
        strpos($buffer, '<b>Notice</b>') !== false ||
        strpos($buffer, '<b>Fatal error</b>') !== false
    ) {
        error_log("HTML error in output buffer: " . substr($buffer, 0, 500));
        return json_encode([
            'status' => false,
            'message' => 'Server error occurred',
            'error_type' => 'html_error_in_response'
        ]);
    }
    return $buffer;
});

// Check if session is already started before starting it
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include(__DIR__ . '/../db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
$con = new mysqli($host, $username, $pass, $dbName);

// Check connection
if ($con->connect_error) {
    $response = new stdClass();
    $response->status = false;
    $response->message = 'Database connection failed: ' . $con->connect_error;
    echo json_encode($response);
    exit;
}

date_default_timezone_set('Asia/Manila');

// Session check endpoint - for debugging
if(isset($_POST['sessionCheck'])){
    $response = new stdClass();
    $response->status = false;
    $response->username = null;
    $response->userId = null;
    $response->message = '';
    
    if(isset($_SESSION['userId']) && !empty($_SESSION['userId'])){
        $userId = $_SESSION['userId'];
        $response->userId = $userId;
        
        $query = "SELECT username FROM capsu_user WHERE id = ? LIMIT 1";
        $statement = $con->prepare($query);
        $statement->bind_param("i", $userId);
        $statement->execute();
        $result = $statement->get_result();
        
        if($result->num_rows > 0){
            $row = $result->fetch_assoc();
            $response->status = true;
            $response->username = $row['username'];
            $response->message = 'Session valid';
        } else {
            $response->message = 'User not found in capsu_user table for ID: ' . $userId;
        }
        $statement->close();
    } else {
        $response->message = 'No active session or userId not set';
        $response->session_data = $_SESSION;
    }
    
    echo json_encode($response);
    exit;
}

// Get Research Chair settings info
if(isset($_POST['getResearchChairSettings'])){
    $response = new stdClass();
    $response->status = false;
    $response->data = null;
    $response->message = '';

    // Check if database connection exists
    if(!$con){
        $response->message = 'Database connection failed';
        echo json_encode($response);
        exit;
    }
    
    // Check if session userId is set
    if(!isset($_SESSION['userId']) || empty($_SESSION['userId'])){
        $response->message = 'Session expired. Please login again.';
        $response->session_id = session_id();
        echo json_encode($response);
        exit;
    }
    
    $id = (int)$_SESSION['userId'];
    
    // Debug: First check if user exists in account_detail
    $checkQuery = "SELECT id FROM account_detail WHERE id = ? LIMIT 1";
    $checkStmt = $con->prepare($checkQuery);
    if(!$checkStmt){
        $response->message = 'Prepare failed: ' . $con->error;
        echo json_encode($response);
        exit;
    }
    
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if($checkResult->num_rows === 0){
        $response->message = 'User not found in account_detail table for ID: ' . $id;
        echo json_encode($response);
        exit;
    }
    $checkStmt->close();
    
    // Now get the full user data with proper JOIN
    $query = "SELECT 
                ad.fullName, 
                ad.center as campus, 
                ad.email, 
                ad.usertype as designation,
                cu.username
              FROM account_detail ad
              LEFT JOIN capsu_user cu ON ad.id = cu.id
              WHERE ad.id = ? LIMIT 1";

    $statement = $con->prepare($query);
    if(!$statement){
        $response->message = 'Prepare failed: ' . $con->error;
        echo json_encode($response);
        exit;
    }
    
    $statement->bind_param("i", $id);
    $statement->execute();
    $result = $statement->get_result();
    
    if ($result->num_rows > 0) {
        $val = $result->fetch_assoc();
        $data = new stdClass();
        $data->fullName = $val['fullName'] ?? '';
        $data->campus = $val['campus'] ?? '';
        $data->email = $val['email'] ?? '';
        $data->designation = $val['designation'] ?? '';
        $data->username = $val['username'] ?? '';
        $response->data = $data;
        $response->status = true;
        $response->message = 'Data retrieved successfully';
    } else {
        $response->message = 'No data found for user ID: ' . $id;
    }
    $statement->close();
    
    echo json_encode($response);
    exit;
}

// Change Research Chair Full Name
if(isset($_POST['changeResearchChairName'])){
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    if(!$con){
        $response->message = 'Database connection error';
        echo json_encode($response);
        exit;
    }
    
    if(!isset($_SESSION['userId'])){
        $response->message = 'Session expired';
        echo json_encode($response);
        exit;
    }
    
    $id = (int)$_SESSION['userId'];
    $name = trim($_POST['data'] ?? '');
    
    if(empty($name)){
        $response->message = 'Name cannot be empty';
        echo json_encode($response);
        exit;
    }
    
    $query = "UPDATE account_detail SET fullName = ? WHERE id = ?";
    $statement = $con->prepare($query);
    $statement->bind_param("si", $name, $id);
    $status = $statement->execute();
    
    if($status){
        $response->status = true;
        $response->message = 'Profile updated successfully!';
        $_SESSION['userFulname'] = $name;
    } else {
        $response->message = 'Update failed: ' . $statement->error;
    }
    $statement->close();
    
    echo json_encode($response);
    exit;
}

// Change Research Chair Designation
if(isset($_POST['changeResearchChairDesignation'])){
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    if(!$con){
        $response->message = 'Database connection error';
        echo json_encode($response);
        exit;
    }
    
    if(!isset($_SESSION['userId'])){
        $response->message = 'Session expired';
        echo json_encode($response);
        exit;
    }
    
    $id = (int)$_SESSION['userId'];
    $designation = trim($_POST['data'] ?? '');
    
    if(empty($designation)){
        $response->message = 'Designation cannot be empty';
        echo json_encode($response);
        exit;
    }
    
    $query = "UPDATE account_detail SET usertype = ? WHERE id = ?";
    $statement = $con->prepare($query);
    $statement->bind_param("si", $designation, $id);
    $status = $statement->execute();
    
    if($status){
        $response->status = true;
        $response->message = 'Designation updated successfully!';
        $_SESSION['userType'] = $designation;
    } else {
        $response->message = 'Update failed: ' . $statement->error;
    }
    $statement->close();
    
    echo json_encode($response);
    exit;
}

// Change Research Chair Email
if(isset($_POST['changeResearchChairEmail'])){
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    if(!$con){
        $response->message = 'Database connection error';
        echo json_encode($response);
        exit;
    }
    
    if(!isset($_SESSION['userId'])){
        $response->message = 'Session expired';
        echo json_encode($response);
        exit;
    }
    
    $id = (int)$_SESSION['userId'];
    $email = trim($_POST['data'] ?? '');
    
    if(empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)){
        $response->message = 'Please provide a valid email address';
        echo json_encode($response);
        exit;
    }
    
    $query = "UPDATE account_detail SET email = ? WHERE id = ?";
    $statement = $con->prepare($query);
    $statement->bind_param("si", $email, $id);
    $status = $statement->execute();
    
    if($status){
        $response->status = true;
        $response->message = 'Email updated successfully!';
        $_SESSION['userEmail'] = $email;
    } else {
        $response->message = 'Update failed: ' . $statement->error;
    }
    $statement->close();
    
    echo json_encode($response);
    exit;
}

// Edit Research Chair Username
if(isset($_POST['editResearchChairUserName'])){
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    if(!$con){
        $response->message = 'Database connection error';
        echo json_encode($response);
        exit;
    }
    
    if(!isset($_SESSION['userId'])){
        $response->message = 'Session expired';
        echo json_encode($response);
        exit;
    }
    
    $userId = (int)$_SESSION['userId'];
    $newUsername = trim($_POST['userNameUpdate'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if(empty($newUsername)){
        $response->message = 'Username cannot be empty';
        echo json_encode($response);
        exit;
    }
    
    if(empty($password)){
        $response->message = 'Password is required';
        echo json_encode($response);
        exit;
    }
    
    // Verify password first
    $query = "SELECT password FROM capsu_user WHERE id = ? LIMIT 1";
    $statement = $con->prepare($query);
    $statement->bind_param("i", $userId);
    $statement->execute();
    $result = $statement->get_result();
    
    if($result->num_rows > 0){
        $val = $result->fetch_assoc();
        if(password_verify($password, $val['password'])){
            // Update username
            $updateQuery = "UPDATE capsu_user SET username = ? WHERE id = ?";
            $updateStatement = $con->prepare($updateQuery);
            $updateStatement->bind_param("si", $newUsername, $userId);
            $res = $updateStatement->execute();
            
            if($res){
                $response->status = true;
                $response->message = 'Username updated successfully!';
                $_SESSION['userName'] = $newUsername;
            } else {
                $response->message = 'Update failed: ' . $updateStatement->error;
            }
            $updateStatement->close();
        } else {
            $response->message = 'Password is incorrect!';
        }
    } else {
        $response->message = 'User not found in capsu_user table!';
    }
    $statement->close();
    
    echo json_encode($response);
    exit;
}

// Edit Research Chair Password
if(isset($_POST['editResearchChairPassword'])){
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    if(!$con){
        $response->message = 'Database connection error';
        echo json_encode($response);
        exit;
    }
    
    if(!isset($_SESSION['userId'])){
        $response->message = 'Session expired';
        echo json_encode($response);
        exit;
    }
    
    $userId = (int)$_SESSION['userId'];
    $oldPass = $_POST['oldPass'] ?? '';
    $newPass = $_POST['newPass'] ?? '';
    $retypePass = $_POST['retypePass'] ?? '';
    
    if(empty($oldPass)){
        $response->message = 'Current password is required';
        echo json_encode($response);
        exit;
    }
    
    if($newPass !== $retypePass){
        $response->message = 'Passwords do not match';
        echo json_encode($response);
        exit;
    }
    
    if(strlen($newPass) < 8){
        $response->message = 'Password must be at least 8 characters';
        echo json_encode($response);
        exit;
    }
    
    // Verify old password
    $query = "SELECT password FROM capsu_user WHERE id = ?";
    $statement = $con->prepare($query);
    $statement->bind_param("i", $userId);
    $statement->execute();
    $result = $statement->get_result();
    
    if($result->num_rows > 0){
        $val = $result->fetch_assoc();
        if(password_verify($oldPass, $val['password'])){
            // Update password
            $updateQuery = "UPDATE capsu_user SET password = ? WHERE id = ?";
            $updateStatement = $con->prepare($updateQuery);
            $hashedPass = password_hash($newPass, PASSWORD_DEFAULT);
            $updateStatement->bind_param("si", $hashedPass, $userId);
            $result = $updateStatement->execute();
            
            if($result){
                $response->status = true;
                $response->message = "Password updated successfully!";
            } else {
                $response->message = 'Update failed: ' . $updateStatement->error;
            }
            $updateStatement->close();
        } else {
            $response->message = 'Current password is incorrect!';
        }
    } else {
        $response->message = 'User not found in capsu_user table!';
    }
    $statement->close();
    
    echo json_encode($response);
    exit;
}

$con->close();
