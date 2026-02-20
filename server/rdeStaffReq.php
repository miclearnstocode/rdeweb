<?php
include('db.php');

/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

if(isset($_POST['rdeAccReq'])){
    $data=[];
    if($con = new mysqli($host, $username, $pass, $dbName)){
        $query="SELECT * FROM rdestaff";
        $statement=$con->prepare($query);
        $statement->execute();
        $res=$statement->get_result();
        while ($val= $res->fetch_assoc()){
            $data[]=$val;
        }
    }
    echo json_encode($data);
}

if(isset($_POST['accountIdRde'])){
    if($con = new mysqli($host, $username, $pass, $dbName)){
        $userID=$_POST['userID'];
        $query="SELECT rdestaff.email as fullname,rdestaff.username FROM rdestaff WHERE rdestaff.id=?";
        $statement=$con->prepare($query);
        $statement->bind_param("s",$userID);
        $statement->execute();
        $result=$statement->get_result();
        echo json_encode($result->fetch_assoc());
    }
}

if(isset($_POST['editNameRde'])){
    $response= new stdClass();
    $response->status=false;
    $response->message='';
    if($con = new mysqli($host, $username, $pass, $dbName)){
        $query="UPDATE rdestaff SET rdestaff.email=? WHERE rdestaff.id=?";
        $id=$_POST['userID'];
        $neName=$_POST['fullNameInput'];
        $statement=$con->prepare($query);
        $statement->bind_param('ss',$neName,$id);
        $status=$statement->execute();
        if($status){
            $response->status=true;
        }else{
            $response->message=$statement->error;
        }
    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}

if(isset($_POST['editUserNameRde'])){
    $response= new stdClass();
    $response->status=false;
    $response->message='';
    if($con = new mysqli($host, $username, $pass, $dbName)){
        $query="UPDATE rdestaff SET rdestaff.username=? WHERE rdestaff.id=?";
        $id=$_POST['userID'];
        $neName=$_POST['fullNameInput'];
        $statement=$con->prepare($query);
        $statement->bind_param('ss',$neName,$id);
        $status=$statement->execute();
        if($status){
            $response->status=true;
        }else{
            $response->message=$statement->error;
        }
    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}

if(isset($_POST['deleteRDEaccount'])){
    $response= new stdClass();
    $response->status=false;
    $response->message='';
    if($con = new mysqli($host, $username, $pass, $dbName)){
        $userId=$_POST['userId'];
        $query="DELETE FROM rdestaff WHERE rdestaff.id=?";
        $statement=$con->prepare($query);
        $statement->bind_param("s",$userId);
        $status=$statement->execute();
        if($status){
            $response->status=true;
        }else{
            $response->message=$statement->error;
        }
    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}

if(isset($_POST['editPass'])){
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    // Log the incoming request
    error_log("Password reset requested for user ID: " . $_POST['userID']);
    
    if($con = new mysqli($host, $username, $pass, $dbName)){
        // First, check if the user exists
        $checkQuery = "SELECT id FROM rdestaff WHERE id = ?";
        $checkStmt = $con->prepare($checkQuery);
        $checkStmt->bind_param("s", $_POST['userID']);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if($checkResult->num_rows === 0) {
            $response->message = 'User not found';
            echo json_encode($response);
            exit();
        }
        $checkStmt->close();
        
        // Hash the new password
        $newPassword = $_POST['changePassInput'];
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        // Log the hash for debugging (remove in production)
        error_log("New password hash created: " . $hashedPassword);
        
        // Update the password
        $query = "UPDATE rdestaff SET password = ? WHERE id = ?";
        $statement = $con->prepare($query);
        $statement->bind_param("ss", $hashedPassword, $_POST['userID']);
        $state = $statement->execute();
        
        if($state){
            // Verify the update was successful
            $verifyQuery = "SELECT password FROM rdestaff WHERE id = ?";
            $verifyStmt = $con->prepare($verifyQuery);
            $verifyStmt->bind_param("s", $_POST['userID']);
            $verifyStmt->execute();
            $verifyResult = $verifyStmt->get_result();
            $row = $verifyResult->fetch_assoc();
            
            if($row && password_verify($newPassword, $row['password'])) {
                $response->status = true;
                $response->message = 'Password updated successfully';
                error_log("Password updated successfully for user ID: " . $_POST['userID']);
            } else {
                $response->message = 'Password update verification failed';
                error_log("Password verification failed after update for user ID: " . $_POST['userID']);
            }
            $verifyStmt->close();
        } else {
            $response->message = $statement->error;
            error_log("Password update failed: " . $statement->error);
        }
        $statement->close();
    } else {
        $response->message = $con->connect_error;
        error_log("Database connection failed: " . $con->connect_error);
    }
    
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}