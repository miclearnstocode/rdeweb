<?php

// Set header FIRST before any output
header('Content-Type: application/json; charset=utf-8');

// Start output buffering to catch any notices/warnings
ob_start();

// Check if session is already started before starting it
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include_once('db.php');

/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
include_once ('Mailer/mailTemplate.php');
include_once ('Mailer/MailSender.php');


$con = new mysqli($host, $username, $pass, $dbName);
date_default_timezone_set('Asia/Manila');


if (isset($_POST['sendFile'])) {
    $res = new stdClass();
    $res->status = false;
    $res->message = 'no';
   // $obj = unserialize($_SESSION['isLog']);
    $sender = $_SESSION['userEmail'];

    if ($con) {
        $fileCount = count($_FILES['file']['name']);
        $receiverCount = count($_POST['receiver']);
        for ($xc = 0; $xc < $receiverCount; $xc++) {
            for ($x = 0; $x < $fileCount; $x++) {
                $filePath='../server/files/'.$_POST['receiver'][$xc].'/' . $_FILES['file']['name'][$x];
                $description= isset($_POST['description']) ? $_POST['description'] : 'No Description';

                if (move_uploaded_file($_FILES['file']['tmp_name'][$x],$filePath)) {
                    $idocs = round(microtime(true) * 1000) . '';
                    $date=date("Y-m-d");
                    $idRec=$_POST['receiver'][$xc];
                    $query="INSERT INTO `files`(`id`, `sender`, `userid`, `description`, `url`, `date`) VALUES (?,?,?,?,?,?)";
                    $stmt = $con->prepare($query);
                    $stmt->bind_param("ssssss",$idocs,$sender,$idRec,$description,$filePath,$date);
                    if($stmt->execute()){
                        $res->status = true;
                        $res->message = 'Success..!';
                    }else{
                        $res->message = $stmt->error;
                    }
                }else{
                    $res->message = 'Directory not existed..!';
                }
            }

            $from=new stdClass();
            $from->email='capizstatecapsudayao@gmail.com';
            $from->password='vuxbtbqimnjiawkw';
            $from->name='Andy Mark Servania';

            $to=new stdClass();
            $to->name="Juan Dela Cruz";
            $to->email=$_POST['receiverEmail'][$xc];
            $emailStatus=SendEmail($from,$to,FileReceive("",""));

            if(!$emailStatus->status){
                $res->message.=$emailStatus->message;
            }


        }

    } else {
        $res->message.= 'Connection Failed..!';
    }
    ob_clean();
    echo json_encode($res);
    ob_end_flush();
    exit();
}



if(isset($_POST['fileSubmit'])){

}



if (isset($_POST['fileSubmit2'])) {

    $res = new stdClass();
    $res->status = false;
    $res->message = 'no';
    $count = count($_FILES['file']['name']);


    for ($x = 0; $x < $count; $x++) {
        if (move_uploaded_file($_FILES['file']['tmp_name'][$x], 'public/files/' . $_FILES['file']['name'][$x])) {
            if ($con) {
                $fileType = new stdClass();
                $fileType->type = 'uploadedFile';
                $fileType->file = 'public/files/' . $_FILES['file']['name'][$x];
                $description = $_POST['description'];
                $status = $_POST['status'];
                $source = mysqli_escape_string($con, json_encode($fileType));
                $recN = $_POST['receiverName'];
                $recI = $_POST['receiverId'];
                $c = count($_POST['receiverName']);
                $status = $_POST['status'];
                $title = $_POST['title'];
                $obj = unserialize($_SESSION['isLog']);
                $sender = $obj->getAccountName();
                $idList = [];
                for ($a = 0; $a < $c; $a++) {
                    $id = $_POST['receiverId'][$a];
                    $name = $_POST['receiverName'][$a];
                    $idList[] = $_POST['receiverId'][$a];

                }
                $year = date('y');
                $month = date('m');
                $day = date('d');
                $idocs = round(microtime(true) * 1000) . '';
                $jsId = json_encode($idList);
                $query = "INSERT INTO `files`(`id`, `sender`, `title`, `description`, `status`, `source`, `year`, `month`, `day`, `idocs`) VALUES ('$jsId','$sender','$title','$description','$status','$source','$year','$month','$day','$idocs')";
                if ($con->query($query)) {
                    $res->status = true;
                    $res->message = 'Save Successfully';
                } else {
                    $res->message = 'Connection Failed';
                }
            }
        } else {
            $res->message = 'Something went wrong...';
            // source file or system generated file should be here.
            // templated docs
        }
    }
    $count = count($_POST['source_file']);

    if ($count > 0) {
        for ($x = 0; $x < $count; $x++) {
            if ($con) {
                $fileType = new stdClass();
                $fileType->type = 'system generated';
                $fileType->file = $_POST['source_file'][$x];
                $description = $_POST['description'];
                $status = $_POST['status'];
                $source = mysqli_escape_string($con, json_encode($fileType));
                $recN = $_POST['receiverName'];
                $recI = $_POST['receiverId'];
                $c = count($_POST['receiverName']);
                $status = $_POST['status'];
                $title = $_POST['title'];
                /*
$_SESSION['login']=true;
$_SESSION['userId']=$id;
$_SESSION['userName']=$userName;
$_SESSION['userType']=$_POST['userType'];
$_SESSION['userFulname']=$fullName;
$_SESSION['userEsign']=json_encode($signature);
$_SESSION['userOffice']=$campus;
$_SESSION['userEmail']=$emailAdd;
$_SESSION['userType']=$userType;

$_SESSION['login'];
$_SESSION['userId'];
$_SESSION['userName'];
$_SESSION['userType'];
$_SESSION['userFulname'];
$_SESSION['userEsign'];
$_SESSION['userOffice'];
$_SESSION['userEmail'];
$_SESSION['userDesignation'];
*/
             //   $obj = unserialize($_SESSION['isLog']);
                $sender = $_SESSION['userFulname'];
                $idList = [];
                for ($a = 0; $a < $c; $a++) {
                    $id = $_POST['receiverId'][$a];
                    //  $name = $_POST['receiverName'][$a];
                    $idList[] = $_POST['receiverId'][$a];

                }
                $year = date('y');
                $month = date('m');
                $day = date('d');
                $jList = json_encode($idList);
                $idocs = round(microtime(true) * 1000) . '';
                $query = "INSERT INTO `files`(`id`, `sender`, `title`, `description`, `status`, `source`, `year`, `month`, `day`, `idocs`) VALUES ('$jList','$sender','$title','$description','$status','$source','$year','$month','$day','$idocs')";
                if ($con->query($query)) {
                    $res->status = true;
                    $res->message = 'Save Successfully';
                } else {
                    $res->message = 'Connection Failed';
                }
            }
        }
    }
    echo json_encode($res);
}


if(isset($_POST['systemFile'])){
   // $obj = unserialize($_SESSION['isLog']);
    $id = $_SESSION['userEmail'];
    $userID=$_SESSION['userId'];
    $response=[];
    if($con){
        $query="SELECT * FROM `systemfiles` WHERE `origin`='$userID'";
        foreach ($con->query($query) as $val){
            //`id`, `origin`, `office`, `name`, `type`, `source`, `date`

            $data=new stdClass();
            $data->docId=$val['id'];
            $data->origin=$val['origin'];
            $data->office=$val['office'];
            $data->name=$val['name'];
            $data->type=$val['type'];
            $data->source=$val['source'];
            $data->date=$val['date'];
            $response[]=$data;

        }
    }
    echo json_encode($response);
}
