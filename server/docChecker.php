<?php
include('db.php');
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
/** @var TYPE_NAME $rdeEmail */
/** @var TYPE_NAME $emailPassword */

if(isset($_POST['checkDocsId'])){
    $docId=$_POST['docIdCheck'];
    $response=new stdClass();
    $response->status=false;
    $response->message=NULL;
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query="SELECT 
communication.docid,
communication.file,
communication.campus,
communication.senderid,
account_detail.fullName,
communication.date
FROM communication 
LEFT JOIN account_detail ON communication.senderid=account_detail.id
WHERE communication.docid=?";
        $statement = $con->prepare($query);
        $statement->bind_param("s",$docId);
        $state= $statement->execute();
        $res=$statement->get_result();
        while ($row = $res->fetch_assoc()){
            $response->status=true;
            $response->message=$row;
        }

    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}
