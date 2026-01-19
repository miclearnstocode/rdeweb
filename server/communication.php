<?php
include('db.php');
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
/** @var TYPE_NAME $rdeEmail */
/** @var TYPE_NAME $emailPassword */

$con = new mysqli($host, $username, $pass, $dbName);
date_default_timezone_set('Asia/Manila');

if (isset($_POST['communicationRequest'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT * FROM communication";
        $statement = $con->prepare($query);
        $status = $statement->execute();
        $result = $statement->get_result();

        while ($val = $result->fetch_assoc()) {
            $response[]=$val;
        }
    }
    echo json_encode($response);
}

if(isset($_POST['deleteapprovalDocs'])){

    $response= new stdClass();
    $response->status=false;
    $response->message="";
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $docId=$_POST['docId'];
        $query="DELETE FROM communication WHERE communication.docid=?";
        $statement=$con->prepare($query);
        $statement->bind_param('s',$docId);
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

if(isset($_POST['communicationFilter'])){
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT * FROM communication WHERE communication.doc_type=?";
        $docTye=$_POST['docType'];
        $statement = $con->prepare($query);
        $statement->bind_param('s',$docTye);
        $status = $statement->execute();
        $result = $statement->get_result();
        while ($val = $result->fetch_assoc()) {
            $response[]=$val;
        }
    }
    echo json_encode($response);
}

if(isset($_POST['perUserCom'])){
    $response=[];
    if($con = new mysqli($host, $username, $pass, $dbName)){
        $query="SELECT * FROM communication WHERE communication.senderid=?";
        $userId=$_SESSION['userId'];
        $statement=$con->prepare($query);
        $statement->bind_param("s",$userId);
        $statement->execute();
        $res=$statement->get_result();
        while($row=$res->fetch_assoc()){
            $response[]=$row;
        }
    }
    echo json_encode($response);
}


if(isset($_POST['fileReq'])){
    $response=new stdClass();
    $response->status=false;
    $response->file="";
    if($con = new mysqli($host, $username, $pass, $dbName)){
        $docId=$_POST['docId'];
        $query="SELECT communication.file FROM communication WHERE communication.docid=?";
        $statement=$con->prepare($query);
        $statement->bind_param("s",$docId);
        $statement->execute();
        $res=$statement->get_result();
        while ($row = $res->fetch_assoc()){
            $response->file=$row['file'];
        }
    }
echo json_encode($response);
}