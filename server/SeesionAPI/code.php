<?php
include_once __DIR__ . '/../db.php';
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
/** @var TYPE_NAME $rdeEmail */
/** @var TYPE_NAME $emailPassword */

include_once __DIR__ . '/../Mailer/mailTemplate.php';
include_once __DIR__ . '/../Mailer/MailSender.php';

if (isset($_POST['codeRequest'])) {
    $response = new stdClass();
    $response->userName = '';
    $response->status = false;
    $response->message = '';
    $response->email = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $from = new stdClass();
        $from->email = $rdeEmail;
        $from->password = $emailPassword;
        $from->name = 'Research, Development and Extension';

        $query = "SELECT capsu_user.username, account_detail.email, capsu_user.id FROM capsu_user
 LEFT JOIN account_detail ON capsu_user.id = account_detail.id
 WHERE account_detail.email = ?";
        $statement = $con->prepare($query);
        $statement->bind_param("s", $_POST['userEmail']);
        $statement->execute();
        $result = $statement->get_result();
        
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                // Generate security code
                $code = rand(100000, 999999);
                
                // Prepare email recipient
                $to = new stdClass();
                $to->name = $row['username'];
                $to->email = $row['email'];
                
                // Send email with the code
                $emailResult = SendEmail($from, $to, Code($code));
                
                // Check if email was sent successfully
                if ($emailResult->status) {
                    $response->userName = $row['username'];
                    $response->status = true;
                    $response->email = $row['email'];
                    $response->message = "Verification code has been sent to your email."; // Generic message, not the code
                    
                    // Store code in session (not returned in response)
                    $_SESSION['rdeSecurityCode'] = $code;
                    $_SESSION['retrieveEmail'] = $row['email'];
                    $_SESSION['code_expire'] = time();
                    $_SESSION['userName'] = $row['username'];
                    $_SESSION['temp_user_id'] = $row['id'];
                } else {
                    $response->message = "Failed to send verification email. Please try again.";
                }
            }
        } else {
            $response->message = "Email address not found";
        }
        $statement->close();
        $con->close();
    } else {
        $response->message = "Database connection failed";
    }
    
    echo json_encode($response);
    exit;
}

if (isset($_POST['codeSession'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    $securityCode = $_POST['securityCode'] ?? '';
    
    // Check if code exists and hasn't expired (10 minutes = 600 seconds)
    if (isset($_SESSION['rdeSecurityCode']) && isset($_SESSION['code_expire'])) {
        $timeElapsed = time() - $_SESSION['code_expire'];
        
        if ($timeElapsed > 600) {
            // Code expired (more than 10 minutes)
            $response->message = "Verification code has expired. Please request a new one.";
            unset($_SESSION['rdeSecurityCode']);
            unset($_SESSION['code_expire']);
        } elseif ($_SESSION['rdeSecurityCode'] == $securityCode) {
            // Code is valid
            $response->status = true;
            $response->userName = $_SESSION['userName'];
            $response->message = "Code verified successfully";
            
            // Clear the code from session after successful verification
            unset($_SESSION['rdeSecurityCode']);
        } else {
            $response->message = "Invalid verification code. Please try again.";
        }
    } else {
        $response->message = "No verification code found. Please request a new one.";
    }
    
    echo json_encode($response);
    exit;
}

if (isset($_POST['changePass'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    // Check if session exists and user is verified
    if (!isset($_SESSION['temp_user_id'])) {
        $response->message = "Session expired. Please request a new verification code.";
        echo json_encode($response);
        exit;
    }
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "UPDATE capsu_user SET capsu_user.password = ? WHERE capsu_user.id = ?";
        $statement = $con->prepare($query);
        $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
        $statement->bind_param("ss", $password, $_SESSION['temp_user_id']);
        $status = $statement->execute();
        
        if ($status) {
            $response->status = true;
            $response->message = "Password changed successfully";
            
            // Clear all session variables after successful password change
            unset($_SESSION['rdeSecurityCode']);
            unset($_SESSION['retrieveEmail']);
            unset($_SESSION['code_expire']);
            unset($_SESSION['userName']);
            unset($_SESSION['temp_user_id']);
        } else {
            $response->message = "Failed to update password: " . $statement->error;
        }
        $statement->close();
        $con->close();
    } else {
        $response->message = "Database connection failed";
    }
    
    echo json_encode($response);
    exit;
}