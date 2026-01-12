<?php
include ('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

date_default_timezone_set('Asia/Manila');

if(isset($_POST['qrchecker'])){
    $response="";
    if($con=new mysqli($host,$username,$pass,$dbName)){
        $docId=$_POST['docId'];
        $query="SELECT communication.file FROM communication WHERE communication.docid=? LIMIT 1";
        $statement=$con->prepare($query);
        $statement->bind_param('s',$docId);
        $statement->execute();
        $res=$statement->get_result();
        while($row=$res->fetch_assoc()){
            $response=$row['file'];
        }
    }
    echo json_encode($response);
}