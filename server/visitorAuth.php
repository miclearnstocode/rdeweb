<?php
header('Content-Type: application/json; charset=utf-8');
include ('db.php');

/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
/** @var TYPE_NAME $rdeEmail */
/** @var TYPE_NAME $emailPassword */


if (isset($_POST['auth'])) {

    //$_SESSION['isLog']=serialize(new Auth(true,$_POST['userType'],$username,'office',$id,$acnem));

    $response = new stdClass();

    $response->status = false;

    $response->message = '';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $userEmail = $_POST['username'];
        $inputPassword = $_POST['password'];

        if ($statement = $con->prepare(" SELECT umb_user.id, umb_user.email,umb_user.password FROM umb_user WHERE umb_user.email=?")) {

            $statement->bind_param("s", $userEmail);

            $statement->execute();

            $statement->store_result();

            if ($statement->num_rows > 0) {

                $statement->bind_result($id,$email, $pass);

                $statement->fetch();

                if (password_verify($inputPassword,$pass)) {

                    $response->message = '/external/users/a/b/c/b/c/d/e/v1';


                    $_SESSION['login']=true;

                    $_SESSION['userId']=$id;

                    $_SESSION['userName']=$username;

                    $_SESSION['userType']='EXTERNAL';

                    $_SESSION['userFulname']=$email;

                    $_SESSION['userEsign']='';

                    $_SESSION['userOffice']='RDE OFFICE';

                    $_SESSION['userEmail']='';

                    $_SESSION['userDesignation']='External User';



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

    // Always output JSON
    echo json_encode($response);
    exit();
}


if(isset($_POST['addExtern'])){
    $response= new stdClass();
    $response->status=false;
    $response->message='';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $accountName=$_POST['accountName'];
        $accountEmail=$_POST['accountEmail'];
        $accountPass=$_POST['accountPass'];
        $statement=$con->prepare("INSERT INTO umb_user( umb_user.account_name,umb_user.email, umb_user.password) VALUES (?,?,?)");
        $pass=password_hash($accountPass,PASSWORD_DEFAULT);
        $statement->bind_param("sss",$accountName,$accountEmail,$pass);
        $stat=$statement->execute();
        if($stat){
           $response->status=true;
        }else{
            $response->message=$statement->error;
        }

    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
    exit();
}

if(isset($_POST['get_umd_user'])){
    $response=[];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $statement=$con->prepare("SELECT * FROM umb_user");
        $statement->execute();
        $result=$statement->get_result();
        while ($res=$result->fetch_assoc()){
            $response[]=$res;
        }
    }
    echo json_encode($response);
}

if(isset($_POST['accountIdDel'])){
    $response= new stdClass();
    $response->status=false;
    $response->message='';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $statement=$con->prepare('DELETE FROM umb_user WHERE umb_user.id=?');
        $statement->bind_param("s",$_POST['accountIdDel']);
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
    exit();
}