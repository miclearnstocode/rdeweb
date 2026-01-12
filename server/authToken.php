<?php

include ('db.php');

/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
/** @var TYPE_NAME $rdeEmail */
/** @var TYPE_NAME $emailPassword */
include_once ('Mailer/mailTemplate.php');
include_once ('Mailer/MailSender.php');

if(isset($_POST['auth'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='no';
    if($_POST['auth']==='login'){
        if($_POST['userType']==='ADMIN'){
            if($con=new mysqli($host,$username,$pass,$dbName)){
                $usernames=$_POST['username'];
                if($statement=$con->prepare("SELECT admin.id,admin.password FROM admin WHERE admin.username=?")){
                    $statement->bind_param('s',$usernames);
                    $statement->execute();
                    $statement->store_result();
                    if($statement->num_rows>0){
                        $statement->bind_result($id,$pas);
                        $statement->fetch();
                        if($pas===$_POST['password']){
                            $response->message='/';
                            $_SESSION['isLog']=serialize(new Auth(true,$_POST['userType'],$_POST['username'],'',$id,'','','',''));
                            $_SESSION['login']=true;
                            $_SESSION['userId']=$id;
                            $_SESSION['userName']='ADMIN';
                            $_SESSION['userType']='ADMIN';
                            $_SESSION['userFulname']='ADMIN';
                            $_SESSION['userEsign']='';
                            $_SESSION['userOffice']='CENTRAL OFFICE';
                            $_SESSION['userEmail']='';

                            $response->status=true;
                        }else{
                            $response->message='Username/Password is incorrect..!';
                        }
                    }else{
                        $response->message='No user found!';
                    }
                }else{
                    $response->message='Something went wrong..!'.$con->error.'oo';
                }
            }else{
                $response->message='Failed to connect..!';
            }
        }else{
            $usernames=$_POST['username'];
            $password=$_POST['password'];
            if($con=new mysqli($host,$username,$pass,$dbName)){
                $loginUSer="SELECT 
       capsu_user.id,
       capsu_user.username,
       capsu_user.password,
       account_detail.fullName,
       account_detail.campus,
       account_detail.email,    
       account_detail.usertype,
       signature.signature_url,
       signature.scale 
FROM account_detail
LEFT JOIN capsu_user ON account_detail.id=capsu_user.id
LEFT JOIN signature ON account_detail.id=signature.user_id WHERE capsu_user.username=?";
                //"SELECT `id`, `email`,`name`, `password`, `office`, `signature`,`fullname` FROM `account` WHERE `username`=?"
                if($statement=$con->prepare($loginUSer)){
                    $statement->bind_param("s",$usernames);
                    $statement->execute();
                    $statement->store_result();
                    if($statement->num_rows>0){
                        $statement->bind_result($id,$userName,$passWord,$fullName,$campus,$emailAdd,$userType,$signUrl,$signScale);
                        $statement->fetch();
                        if(password_verify($password,$passWord)){
                            $response->message='/';
                            $signature= new stdClass();
                            $signature->url=$signUrl;
                            $signature->scale=$signScale;
                            $_SESSION['isLog']=serialize(new Auth(true,$_POST['userType'],$userName,$campus,$id,$userType,$emailAdd,$fullName,json_encode($signature)));
                            $_SESSION['login']=true;
                            $_SESSION['userId']=$id;
                            $_SESSION['userName']=$userName;
                            $_SESSION['userType']=$_POST['userType'];
                            $_SESSION['userFulname']=$fullName;
                            $_SESSION['userEsign']=json_encode($signature);
                            $_SESSION['userOffice']=$campus;
                            $_SESSION['userEmail']=$emailAdd;
                            $_SESSION['userDesignation']=$userType;
                            $response->status=true;
                        }else{
                            $response->message='Password is incorrect';
                        }
                    }else{
                        $response->message='Username not found..!';
                    }
                }else{
                    $response->message='Something went wrong..!'.$con->error.'00';
                }
            }else{
                $response->message='Connection error';
            }
        }
        echo json_encode($response);
    }


    if($_POST['auth']==='signup'){

        $email=$_POST['userEmail'];
        $campus=$_POST['cName'];
        $usernames=$_POST['username'];
        $fullname=$_POST['fullName'];
        $password=password_hash($_POST['password'],PASSWORD_DEFAULT);
        $office=$_POST['cName'];
        if($con=new mysqli($host,$username,$pass,$dbName)){


            $emDop="SELECT COUNT(*) FROM account_detail WHERE account_detail.email=? AND account_detail.campus=?";
            $emDopStatement=$con->prepare($emDop);
            $emDopStatement->bind_param('ss',$email,$campus);
            $emDopStatement->execute();
            $row=$emDopStatement->get_result()->fetch_row();


            if($row[0] !== 0){
                $userNameCheck="SELECT COUNT(*) FROM capsu_user WHERE capsu_user.username=?";
                $userStatmentCheck=$con->prepare($userNameCheck);
                $userStatmentCheck->bind_param("s",$usernames);
                $userStatmentCheck->execute();
                $usRow=$userStatmentCheck->get_result()->fetch_row();
                if($usRow[0]=== 0){

                    $checkEmail="SELECT capsu_user.id FROM capsu_user LEFT JOIN account_detail ON capsu_user.id=account_detail.id WHERE account_detail.email=?";
                    $checkStm=$con->prepare($checkEmail);
                    $checkStm->bind_param("s",$email);
                    $checkStm->execute();
                    $checkStm->store_result();
                    if((!$checkStm->num_rows) > 0){
                        $queryUser="INSERT  INTO capsu_user (capsu_user.id,capsu_user.username,capsu_user.password) SELECT account_detail.id,?,? FROM account_detail WHERE account_detail.email=? AND account_detail.campus=? LIMIT 1";
                        $stm=$con->prepare($queryUser);
                        $stm->bind_param("ssss",$usernames,$password,$email,$campus);
                        if($stm->execute()){
                            $upDe="UPDATE account_detail SET account_detail.fullName=? WHERE account_detail.email=? AND account_detail.campus=?";
                            $state=$con->prepare($upDe);
                            $state->bind_param("sss",$fullname,$email,$campus);
                            if($state->execute()){
                                $from=new stdClass();
                                $from->email=$rdeEmail;
                                $from->password=$emailPassword;
                                $from->name='Research, Development and Extension';
                                $to=new stdClass();
                                $to->name=$fullname;
                                $to->email=$email;
                                SendEmail($from,$to,Signup($usernames,$_POST['password'],$office));
                                $response->status=true;
                                $response->message="/";
                            }else{
                                $response->message=$state->error;
                            }

                        }else{
                            $response->message="Email address not found..! \n please check the input details";
                        }
                    }else{
                        $response->message="Email address is already in used. \n Please select another email account";
                    }
                }else{
                    $response->message="Username is not available..!";
                }


            }else{
                $response->message="Email address not found..! \n Please select another email account";
            }
        }else{
            $response->message='Failed to connect..!';
        }
        echo json_encode($response);
    }

}

if(isset($_POST['logout'])){
    session_destroy();
    echo "/";
}


