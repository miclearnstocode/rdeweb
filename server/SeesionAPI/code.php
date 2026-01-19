<?php
include('db.php');
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
/** @var TYPE_NAME $rdeEmail */
/** @var TYPE_NAME $emailPassword */

include_once('Mailer/mailTemplate.php');
include_once('Mailer/MailSender.php');

if (isset($_POST['codeRequest'])) {
    $response = new stdClass();
    $response->userName = '';
    $response->status = false;
    $response->message='';
    $response->email='';

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $from = new stdClass();
        $from->email = $rdeEmail;
        $from->password = $emailPassword;
        $from->name = 'Research, Development and Extension';

        $query = "SELECT capsu_user.username,account_detail.email,capsu_user.id FROM capsu_user
 LEFT JOIN account_detail ON capsu_user.id=account_detail.id
 WHERE account_detail.email=?";
        $statement = $con->prepare($query);
        $statement->bind_param("s", $_POST['userEmail']);
        $statement->execute();
        $result = $statement->get_result();
        if ($result->num_rows > 0) {

            while ($row = $result->fetch_assoc()) {
                $code='';
                try {
                    $code=rand(100000, 999999);
                } catch (Exception $e) {
                    $response->message=$e;
                }
                $to = new stdClass();
                $to->name = $row['username'];
                $to->email = $row['email'];
                $response->userName=$row['username'];
                $response->status = true;
                $response->email=$row['email'];
                $response->message= SendEmail($from, $to, Code($code));
                $_SESSION['rdeSecurityCode']=$code;
                $_SESSION['retrieveEmail']=$row['email'];
                $_SESSION['code_expire']=time();
                $_SESSION['userName']=$row['username'];
                $_SESSION['temp_user_id']=$row['id'];
                $response->message=$code;
            }
        } else {
            $response->message="Email address not found";
        }

    }else{
        $response->message=$con->error;
    }
     echo json_encode($response);

}


if(isset($_POST['changePass'])){
    $response= new stdClass();
    $response->status = false;
    $response->message='';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query="UPDATE capsu_user SET capsu_user.password=? WHERE capsu_user.id=? ";
        $statement=$con->prepare($query);
        $password=password_hash($_POST['password'],PASSWORD_DEFAULT);
        $statement->bind_param("ss",$password,$_SESSION['temp_user_id']);
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
