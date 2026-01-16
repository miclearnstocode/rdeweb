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
    $response=new stdClass();
    $response->status=false;
    $response->message='';
    $campus=$_POST['office'];
    $email=$_POST['email'];
    $userType=$_POST['accountName'];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $checkEmail="SELECT count(*) FROM account_detail WHERE account_detail.email=?";
        $checkSt=$con->prepare($checkEmail);
        $checkSt->bind_param("s",$email);
        $checkSt->execute();
        $found= $checkSt->get_result()->fetch_row();
        if($found[0]===0){
            $queryInsert="INSERT INTO account_detail (account_detail.campus, account_detail.email, account_detail.usertype) VALUES (?,?,?)";
            $statement=$con->prepare($queryInsert);

            $statement->bind_param("sss",$campus,$email,$userType);
            $result=$statement->execute();
            if($result){
                $response->status=true;
                $response->message='New users account was successfully created..';
                $from=new stdClass();
                $from->email=$rdeEmail;
                $from->password=$emailPassword;
                $from->name='Research, Development and Extension';
                $to=new stdClass();
                $to->name=$userType;
                $to->email=$email;
                $emailResult=SendEmail($from,$to,AccountCreation($campus,$email));
                if($emailResult->status){
                    $response->message='New users account was successfully created. Verification email has been sent to '.$email;
                }else{
                    error_log('Email sending failed for '.$email.': '.$emailResult->message);
                    $response->message='Account created but email sending failed. Please contact administrator.';
                }
            }else{
                $response->message=$con->error;
            }
            echo $statement->error;
        }else{
            $response->message='Email is already in used..!';
        }

    }else{
        $response->message=$con->error;
    }

    echo json_encode($response);
}