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
    $response= new stdClass();
    $response->status=false;
    $response->message='';
    if($con = new mysqli($host, $username, $pass, $dbName)){
        $query="UPDATE rdestaff SET rdestaff.password=? WHERE rdestaff.id=?";
        $statement=$con->prepare($query);
        $password=password_hash($_POST['changePassInput'],PASSWORD_DEFAULT);
        $statement->bind_param("ss",$password,$_POST['userID']);
        $state=$statement->execute();
        if($state){
            $response->status=true;
        }else{
            $response->message=$statement->error;
        }

    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}