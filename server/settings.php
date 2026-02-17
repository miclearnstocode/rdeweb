<?php
include ('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
$con=new mysqli($host,$username,$pass,$dbName);
date_default_timezone_set('Asia/Manila');


if(isset($_POST['settingsInfo'])){
    $response= new stdClass();
    $response->status=false;
    $response->data='';

    if($con){
        $query="SELECT account_detail.fullName,account_detail.center,account_detail.email,account_detail.usertype,capsu_user.username 
FROM account_detail 
LEFT JOIN capsu_user ON account_detail.id=capsu_user.id
WHERE account_detail.id=? LIMIT 1";



       // $userData = unserialize($_SESSION['isLog']);
        $id=$_SESSION['userId'];

        $statement=$con->prepare($query);
        $statement->bind_param("s",$id);
        $statement->execute();
        $result=$statement->get_result();
        while ($val=$result->fetch_assoc()){
            $data=new stdClass();
            $data->fullName=$val['fullName'];
            $data->campus=$val['campus'];
            $data->email=$val['email'];
            $data->userType=$val['usertype'];
            $data->username=$val['username'];
            $response->data=$data;
            $response->status=true;
        }
    }
    echo json_encode($response);
}



/*
 *
                            $_SESSION['login']=true;
                            $_SESSION['userId']=$id;
                            $_SESSION['userName']=$userName;
                            $_SESSION['userType']=$_POST['userType'];
                            $_SESSION['userFulname']=$fullName;
                            $_SESSION['userEsign']=json_encode($signature);
                            $_SESSION['userOffice']=$campus;
                            $_SESSION['userEmail']=$emailAdd;
                            $_SESSION['userType']=$userType;
 */
if(isset($_POST['changeName'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='';
    if($con){
       // $userData = unserialize($_SESSION['isLog']);


        $id= $_SESSION['userId'];
        $query="UPDATE account_detail SET account_detail.fullName=? WHERE account_detail.id=?";
        $name=$_POST['data'];
        $statement=$con->prepare($query);
        $statement->bind_param("ss",$name,$id);
        $status=$statement->execute();
        if($status){
            //serialize(new Auth(true,$_POST['userType'],$userName,$campus,$id,$userType,$emailAdd,$fullName,json_encode($signature)));
            $response->status=true;
            $response->message='Profile updated successful..!';
            $_SESSION['userFulname']=$name;

        }else{
            $response->message=$con->error;
        }

    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}

if(isset($_POST['changeDesignation'])){
    $response= new stdClass();
    $response->status=false;
    $response->message='';
    if($con){
        $id= $_SESSION['userId'];
        $query="UPDATE account_detail SET account_detail.usertype=? WHERE account_detail.id=?";
        $name=$_POST['data'];
        $statement=$con->prepare($query);
        $statement->bind_param("ss",$name,$id);
        $status=$statement->execute();
        if($status){
            //serialize(new Auth(true,$_POST['userType'],$userName,$campus,$id,$userType,$emailAdd,$fullName,json_encode($signature)));
            $response->status=true;
            $response->message='Profile updated successful..!';
            $_SESSION['userType']=$name;

        }else{
            $response->message=$con->error;
        }

    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}

if(isset($_POST['changeEmail'])){
    $response= new stdClass();
    $response->status=false;
    $response->message='';
    if($con){
        $id= $_SESSION['userId'];
        $query="UPDATE account_detail SET account_detail.email=? WHERE account_detail.id=?";
        $name=$_POST['data'];
        $statement=$con->prepare($query);
        $statement->bind_param("ss",$name,$id);
        $status=$statement->execute();
        if($status){
            //serialize(new Auth(true,$_POST['userType'],$userName,$campus,$id,$userType,$emailAdd,$fullName,json_encode($signature)));
            $response->status=true;
            $response->message='Profile updated successful..!';
            $_SESSION['userEmail']=$name;

        }else{
            $response->message=$con->error;
        }

    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}
if(isset($_POST['changeCampus'])){
    $response= new stdClass();
    $response->status=false;
    $response->message='';
    if($con){
        $id= $_SESSION['userId'];
        $query="UPDATE account_detail SET account_detail.center=? WHERE account_detail.id=?";
        $name=$_POST['data'];
        $statement=$con->prepare($query);
        $statement->bind_param("ss",$name,$id);
        $status=$statement->execute();
        if($status){
            //serialize(new Auth(true,$_POST['userType'],$userName,$campus,$id,$userType,$emailAdd,$fullName,json_encode($signature)));
            $response->status=true;
            $response->message='Profile updated successful..!';
            $_SESSION['userOffice']=$name;

        }else{
            $response->message=$con->error;
        }

    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}

if(isset($_POST['editUserName'])){
    $response= new stdClass();
    $response->status=false;
    $response->message='';
    if($con){
        $query="SELECT capsu_user.password FROM capsu_user WHERE capsu_user.id=? LIMIT 1";
        $statement=$con->prepare($query);
        $statement->bind_param('s',$_SESSION['userId']);
        $statement->execute();
        $result=$statement->get_result();
        if($result->num_rows>0){
            while ($val=$result->fetch_assoc()){
                if(password_verify($_POST['password'],$val['password'])){
                    $updateQuery="UPDATE capsu_user SET capsu_user.username=? WHERE capsu_user.id=?";
                    $updateStatement=$con->prepare($updateQuery);
                    $updateStatement->bind_param('ss',$_POST['userNameUpdate'],$_SESSION['userId']);
                    $res=$updateStatement->execute();
                    if($res){
                        $response->status=true;
                        $response->message='Success..!';
                        $_SESSION['userName']=$_POST['userNameUpdate'];
                    }else{
                        $response->message=$updateStatement->error;
                    }
                }else{
                    $response->message='Password is incorrect..!';
                }
            }
        }else{
            $response->message='User not found..!';
        }

    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}
/*
 *
 *  request.push({
                                        reqName: 'editPassword',
                                        reqVal: 'true'
                                    })
                                    request.push({
                                        reqName: 'oldPass',
                                        reqVal: prevPass
                                    })
                                    request.push({
                                        reqName: 'newPass',
                                        reqVal: newPassw
                                    })
                                    request.push({
                                        reqName: 'retypePass',
                                        reqVal: reType
                                    })
 *
 */
if(isset($_POST['editPassword'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='';
    if($con){

        if($_POST['newPass']===$_POST['retypePass']){
            $newP=$_POST['newPass'];
            $rePas=$_POST['retypePass'];
            if(strlen($_POST['newPass'])>=8&& strlen($_POST['retypePass'])>=8){
                $query="SELECT capsu_user.password FROM capsu_user WHERE capsu_user.id=?";
                $statement=$con->prepare($query);
                $statement->bind_param('s',$_SESSION['userId']);
                $statement->execute();
                $result=$statement->get_result();
                if($result->num_rows>0){
                    while ($val=$result->fetch_assoc()){
                        if(password_verify($_POST['oldPass'],$val['password'])){
                            $updateQuery="UPDATE capsu_user SET capsu_user.password=? WHERE capsu_user.id=?";
                            $updateStatement=$con->prepare($updateQuery);
                            $pass=password_hash($_POST['newPass'],PASSWORD_DEFAULT);
                            $updateStatement->bind_param("ss",$pass,$_SESSION['userId']);
                            $result=$updateStatement->execute();
                            if($result){
                                $response->status=true;
                                $response->message="Password updated....!";
                            }else{
                                $response->message=$con->error;
                            }
                        }else{
                            $response->message='Current password is incorrect..!';
                        }
                    }
                }else{
                    $response->message='No Users found';
                }
            }else{
                $response->message='Please provide 8 to 20 valid characters...!'.strlen($_POST['newPass']).'==.'.strlen($_POST['newPass']);
            }
        }else{
            $response->message='Password Not match';
        }

    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}