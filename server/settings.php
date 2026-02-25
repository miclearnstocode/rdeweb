<?php
include ('db.php'); // db.php should already have session_start()
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
$con = new mysqli($host, $username, $pass, $dbName);
date_default_timezone_set('Asia/Manila');

// Remove the duplicate session_start() since it's already in db.php

if(isset($_POST['settingsInfo'])){
    $response = new stdClass();
    $response->status = false;
    $response->data = '';

    if($con){
        // Fix the query - 'campus' field doesn't exist, use 'center' instead
        $query = "SELECT account_detail.fullName, 
                         account_detail.center as campus, 
                         account_detail.email, 
                         account_detail.usertype as userType, 
                         capsu_user.username 
                  FROM account_detail 
                  LEFT JOIN capsu_user ON account_detail.id = capsu_user.id
                  WHERE account_detail.id = ? LIMIT 1";

        $id = $_SESSION['userId'];

        $statement = $con->prepare($query);
        $statement->bind_param("s", $id);
        $statement->execute();
        $result = $statement->get_result();
        
        if ($result->num_rows > 0) {
            while ($val = $result->fetch_assoc()) {
                $data = new stdClass();
                $data->fullName = $val['fullName'] ?? '';
                $data->campus = $val['campus'] ?? ''; // Now using 'campus' alias from 'center'
                $data->email = $val['email'] ?? '';
                $data->userType = $val['userType'] ?? '';
                $data->username = $val['username'] ?? '';
                $response->data = $data;
                $response->status = true;
            }
        } else {
            $response->message = 'User not found';
        }
    } else {
        $response->message = 'Database connection error';
    }
    echo json_encode($response);
    exit;
}

if(isset($_POST['changeName'])){
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    if($con){
        $id = $_SESSION['userId'];
        $query = "UPDATE account_detail SET account_detail.fullName = ? WHERE account_detail.id = ?";
        $name = $_POST['data'];
        $statement = $con->prepare($query);
        $statement->bind_param("ss", $name, $id);
        $status = $statement->execute();
        
        if($status){
            $response->status = true;
            $response->message = 'Profile updated successfully!';
            $_SESSION['userFulname'] = $name;
        } else {
            $response->message = $con->error;
        }
    } else {
        $response->message = 'Database connection error';
    }
    echo json_encode($response);
    exit;
}

if(isset($_POST['changeDesignation'])){
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    if($con){
        $id = $_SESSION['userId'];
        $query = "UPDATE account_detail SET account_detail.usertype = ? WHERE account_detail.id = ?";
        $name = $_POST['data'];
        $statement = $con->prepare($query);
        $statement->bind_param("ss", $name, $id);
        $status = $statement->execute();
        
        if($status){
            $response->status = true;
            $response->message = 'Profile updated successfully!';
            $_SESSION['userType'] = $name;
        } else {
            $response->message = $con->error;
        }
    } else {
        $response->message = 'Database connection error';
    }
    echo json_encode($response);
    exit;
}

if(isset($_POST['changeEmail'])){
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    if($con){
        $id = $_SESSION['userId'];
        $query = "UPDATE account_detail SET account_detail.email = ? WHERE account_detail.id = ?";
        $name = $_POST['data'];
        $statement = $con->prepare($query);
        $statement->bind_param("ss", $name, $id);
        $status = $statement->execute();
        
        if($status){
            $response->status = true;
            $response->message = 'Profile updated successfully!';
            $_SESSION['userEmail'] = $name;
        } else {
            $response->message = $con->error;
        }
    } else {
        $response->message = 'Database connection error';
    }
    echo json_encode($response);
    exit;
}

if(isset($_POST['changeCampus'])){
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    if($con){
        $id = $_SESSION['userId'];
        $query = "UPDATE account_detail SET account_detail.center = ? WHERE account_detail.id = ?";
        $name = $_POST['data'];
        $statement = $con->prepare($query);
        $statement->bind_param("ss", $name, $id);
        $status = $statement->execute();
        
        if($status){
            $response->status = true;
            $response->message = 'Profile updated successfully!';
            $_SESSION['userOffice'] = $name;
        } else {
            $response->message = $con->error;
        }
    } else {
        $response->message = 'Database connection error';
    }
    echo json_encode($response);
    exit;
}

if(isset($_POST['editUserName'])){
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    if($con){
        $query = "SELECT capsu_user.password FROM capsu_user WHERE capsu_user.id = ? LIMIT 1";
        $statement = $con->prepare($query);
        $statement->bind_param('s', $_SESSION['userId']);
        $statement->execute();
        $result = $statement->get_result();
        
        if($result->num_rows > 0){
            while ($val = $result->fetch_assoc()){
                if(password_verify($_POST['password'], $val['password'])){
                    $updateQuery = "UPDATE capsu_user SET capsu_user.username = ? WHERE capsu_user.id = ?";
                    $updateStatement = $con->prepare($updateQuery);
                    $updateStatement->bind_param('ss', $_POST['userNameUpdate'], $_SESSION['userId']);
                    $res = $updateStatement->execute();
                    
                    if($res){
                        $response->status = true;
                        $response->message = 'Username updated successfully!';
                        $_SESSION['userName'] = $_POST['userNameUpdate'];
                    } else {
                        $response->message = $updateStatement->error;
                    }
                } else {
                    $response->message = 'Password is incorrect!';
                }
            }
        } else {
            $response->message = 'User not found!';
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
    exit;
}

if(isset($_POST['editPassword'])){
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    if($con){
        if($_POST['newPass'] === $_POST['retypePass']){
            $newP = $_POST['newPass'];
            $rePas = $_POST['retypePass'];
            
            if(strlen($_POST['newPass']) >= 8 && strlen($_POST['retypePass']) >= 8){
                $query = "SELECT capsu_user.password FROM capsu_user WHERE capsu_user.id = ?";
                $statement = $con->prepare($query);
                $statement->bind_param('s', $_SESSION['userId']);
                $statement->execute();
                $result = $statement->get_result();
                
                if($result->num_rows > 0){
                    while ($val = $result->fetch_assoc()){
                        if(password_verify($_POST['oldPass'], $val['password'])){
                            $updateQuery = "UPDATE capsu_user SET capsu_user.password = ? WHERE capsu_user.id = ?";
                            $updateStatement = $con->prepare($updateQuery);
                            $pass = password_hash($_POST['newPass'], PASSWORD_DEFAULT);
                            $updateStatement->bind_param("ss", $pass, $_SESSION['userId']);
                            $result = $updateStatement->execute();
                            
                            if($result){
                                $response->status = true;
                                $response->message = "Password updated successfully!";
                            } else {
                                $response->message = $con->error;
                            }
                        } else {
                            $response->message = 'Current password is incorrect!';
                        }
                    }
                } else {
                    $response->message = 'No user found';
                }
            } else {
                $response->message = 'Please provide 8 to 20 valid characters!';
            }
        } else {
            $response->message = 'Passwords do not match';
        }
    } else {
        $response->message = $con->error;
    }
    echo json_encode($response);
    exit;
}