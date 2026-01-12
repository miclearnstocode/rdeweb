<?php
session_start();
include ('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

if(isset($_POST['sessionChecker'])){
    $response=new stdClass();
    $response->status=false;
    $response->username='';
    $response->message='';
    $response->userType='';
    $data='';
    if(!isset($_SESSION['isLog'])){
        $response->status=true;
        $response->message='/';
    }else{
        $response->message=$_SESSION['userType'];
    }
    echo json_encode($response);
}
if(isset($_POST['getUser'])){
   // $data=unserialize($_SESSION['isLog']);
    echo $_SESSION['userDesignation'];
}

if(isset($_POST['getUserName'])){
   // $data=unserialize($_SESSION['isLog']);
    echo $_SESSION['userName'];
}
