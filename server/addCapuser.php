<?php

include('db.php');

/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
/** @var TYPE_NAME $rdeEmail */
/** @var TYPE_NAME $emailPassword */
include_once ('Mailer/mailTemplate.php');
include_once ('Mailer/MailSender.php');

if(isset($_POST['registerAccount'])){
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $campus = $_POST['campus'] ?? '';
    $center = $_POST['center'] ?? '';
    $email = $_POST['email'] ?? '';
    $userType = $_POST['accountName'] ?? '';
    
    // Validate required fields
    if(empty($center) || empty($email) || empty($userType)) {
        $response->message = 'Required fields are missing';
        echo json_encode($response);
        exit;
    }
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Check if email already exists
        $checkEmail = "SELECT COUNT(*) FROM account_detail WHERE account_detail.email = ?";
        $checkSt = $con->prepare($checkEmail);
        $checkSt->bind_param("s", $email);
        $checkSt->execute();
        $found = $checkSt->get_result()->fetch_row();
        
        if($found[0] == 0){
            // Fixed SQL query - removed the dot after usertype and fixed column list
            $queryInsert = "INSERT INTO account_detail (center, email, usertype, campus) VALUES (?, ?, ?, ?)";
            $statement = $con->prepare($queryInsert);
            
            // Fixed bind_param - "ssss" for 4 string parameters
            $statement->bind_param("ssss", $center, $email, $userType, $campus);
            $result = $statement->execute();
            
            if($result){
                $response->status = true;
                $response->message = 'New user account was successfully created.';
                
                // Check if $rdeEmail and $emailPassword are defined somewhere
                if(isset($rdeEmail) && isset($emailPassword)) {
                    $from = new stdClass();
                    $from->email = $rdeEmail;
                    $from->password = $emailPassword;
                    $from->name = 'Research, Development and Extension';
                    
                    $to = new stdClass();
                    $to->name = $userType;
                    $to->email = $email;
                    
                    $emailResult = SendEmail($from, $to, AccountCreation($center, $email, $campus));
                    
                    if($emailResult->status){
                        $response->message = 'New user account was successfully created. Verification email has been sent to ' . $email;
                    } else {
                        error_log('Email sending failed for ' . $email . ': ' . $emailResult->message);
                        $response->message = 'Account created but email sending failed. Please contact administrator.';
                    }
                } else {
                    error_log('Email configuration missing');
                    $response->message = 'Account created but email configuration is missing.';
                }
            } else {
                $response->message = 'Database error: ' . $statement->error;
            }
            $statement->close();
        } else {
            $response->message = 'Email is already in use!';
        }
        
        $checkSt->close();
        $con->close();
    } else {
        $response->message = 'Database connection failed: ' . $con->connect_error;
    }

    echo json_encode($response);
    exit;
}