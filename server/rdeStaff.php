<?php

// Set header FIRST before any output
header('Content-Type: application/json; charset=utf-8');

// Start output buffering to catch any notices/warnings
ob_start();

// Check if session is already started before starting it
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include('db.php');

/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
$con = new mysqli($host, $username, $pass, $dbName);

if(isset($_POST['submitStaff'])){
    $response=new stdClass();
    $response->status=false;
    $response->message="";

    if($con){
        $id=round(microtime(true) * 1000) . '';
        $email=$_POST['staffEmail'];
        $username=$_POST['staffUserName'];
        $password=password_hash($_POST['staffPassword'],PASSWORD_DEFAULT);

        $query="INSERT INTO `rdestaff`(`id`, `email`, `username`, `password`) VALUES ('$id','$email','$username','$password')";
        if($con->query($query)){
            $response->status=true;
            $response->message="/";
        }else{
            $response->message=$con->error;
        }
    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}

/*
 *
 *  form.append('auth', 'login')
                                            form.append('userType', usertype.toUpperCase())
                                            form.append('username', username)
                                            form.append('password', password)
 */

if (isset($_POST['auth'])) {
    //  $_SESSION['isLog']=serialize(new Auth(true,$_POST['userType'],$username,'office',$id,$acnem));
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    if ($con) {
        $username = trim($_POST['username']);
        $password = trim($_POST['password']); 
        if ($statement = $con->prepare(" SELECT `id`, `email`, `password` FROM `rdestaff` WHERE `username`=?")) {
            $statement->bind_param("s", $username);
            $statement->execute();
            $statement->store_result();
            if ($statement->num_rows > 0) {
                $statement->bind_result($id,$email, $pass);
                $statement->fetch();
                if (password_verify($password, $pass)) {
                    $response->message = '/rdeOffice/dashboard';
                    $_SESSION['isLog'] = serialize(new Auth(true, $_POST['userType'], $username, 'RDE ', $id, $username,$email,'',''));
                    $_SESSION['login']=true;
                    $_SESSION['userId']=$id;
                    $_SESSION['userName']=$username;
                    $_SESSION['userType']=$_POST['userType'];
                    $_SESSION['userFulname']=$email;
                    $_SESSION['userEsign']='';
                    $_SESSION['userOffice']='RDE OFFICE';
                    $_SESSION['userEmail']='';
                    $_SESSION['userDesignation']='RDE STAFF';

                    $response->status = true;
                } else {
                    $response->message = 'Password is incorrect';
                }
            } else {
                $response->message = 'ID/Username not found..!';
            }
        } else {
            $response->message = 'Something went wrong..!';
        }
    }
    echo json_encode($response);
}