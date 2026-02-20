<?php
include_once('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */


if (isset($_POST['updateName'])) {
    $response = new stdClass();
    $response->status = false;
    $response->messages = 'Unable connected...!';
    $data = unserialize($_SESSION['isLog']);
    $id = $data->getId();
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $response->messages = 'Connected Successfully..!';
        //UPDATE `account` SET `data`='[value-8]' WHERE `id`='$id'
        $fullName = $_POST['fullname'];
        $query = "UPDATE `account` SET `fullname`='$fullName' WHERE `id`='$id'";
        if ($con->query($query)) {
            $response->status = true;
            $response->messages = 'Updated successfully..!';
        }
    }
    echo json_encode($response);
}

if (isset($_POST['deleteUser'])) {
    $response = new stdClass();
    $response->status = false;
    $response->messages = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $userId = $_POST['userID'];

        $query = "DELETE FROM account_detail WHERE account_detail.id=?";
        $statement= $con->prepare($query);
        $statement->bind_param('s',$userId);
        $statement->execute();
        $result= $statement->execute();
        if($result){

            $response->status = true;
        }else{
            $response->messages = 'Failed to delete ...! ' . $con->error;
        }

    } else {
        $response->messages = 'Unable to connect...!' . $con->error;
    }
    echo json_encode($response);
}


if (isset($_POST['addOffice'])) {
    $response = new stdClass();
    $response->status = false;
    $response->messages = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $officeName = $_POST['officeName'];
        $abbrev = $_POST['abbrev'];
        $timeStamp = round(microtime(true) * 1000) . '';
        $query = "INSERT INTO `office`( `id`,`officename`, `abbrev`) VALUES ('$timeStamp','$officeName','$abbrev')";
        if ($con->query($query)) {
            $response->status = true;
        } else {
            $response->messages = 'Failed save ...! ' . $con->error;
        }
    } else {
        $response->messages = 'Unable to connect...!' . $con->error;
    }
    echo json_encode($response);
}
if (isset($_POST['getOffice'])) {
    $list = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT * FROM `office` ";
        //`id`, `officename`, `abbrev`, `email`
        foreach ($con->query($query) as $val) {
            $data = new stdClass();
            $data->officeName = $val['officename'];
            $data->abbrevation = $val['abbrev'];
            $list[] = $data;
        }
    }
    echo json_encode($list);
}

// Add this to updates.php
if (isset($_POST['resetCapsuPassword'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    error_log("Password reset requested for CAPSU user ID: " . $_POST['userID']);
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // First, check if the user exists in capsu_user table
        $checkQuery = "SELECT id FROM capsu_user WHERE id = ?";
        $checkStmt = $con->prepare($checkQuery);
        $checkStmt->bind_param("s", $_POST['userID']);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            $response->message = 'User not found';
            echo json_encode($response);
            exit();
        }
        $checkStmt->close();
        
        // Hash the new password
        $newPassword = $_POST['newPassword'];
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        error_log("New password hash created for CAPSU user: " . $hashedPassword);
        
        // Update the password in capsu_user table
        $query = "UPDATE capsu_user SET password = ? WHERE id = ?";
        $statement = $con->prepare($query);
        $statement->bind_param("ss", $hashedPassword, $_POST['userID']);
        $state = $statement->execute();
        
        if ($state) {
            // Verify the update was successful
            $verifyQuery = "SELECT password FROM capsu_user WHERE id = ?";
            $verifyStmt = $con->prepare($verifyQuery);
            $verifyStmt->bind_param("s", $_POST['userID']);
            $verifyStmt->execute();
            $verifyResult = $verifyStmt->get_result();
            $row = $verifyResult->fetch_assoc();
            
            if ($row && password_verify($newPassword, $row['password'])) {
                $response->status = true;
                $response->message = 'Password updated successfully';
                error_log("Password updated successfully for CAPSU user ID: " . $_POST['userID']);
            } else {
                $response->message = 'Password update verification failed';
                error_log("Password verification failed after update for CAPSU user ID: " . $_POST['userID']);
            }
            $verifyStmt->close();
        } else {
            $response->message = $statement->error;
            error_log("Password update failed for CAPSU user: " . $statement->error);
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