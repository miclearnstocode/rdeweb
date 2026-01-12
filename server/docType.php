<?php
include('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

if(isset($_POST['addDoctype'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $docTypeName=$_POST['doctype'];
        $query="INSERT INTO document_type (document_type.name) VALUES (?)";
        $statement=$con->prepare($query);
        $statement->bind_param("s",$docTypeName);
        $state=$statement->execute();
        if($state){
            $response->status=true;
            $response->message="Saved successfully";
        }else{
            $response->message=$statement->error;
        }

    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}


if(isset($_POST['getDoctype'])){
    $response=[];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query="SELECT * FROM `document_type`";
        $statement=$con->prepare($query);
        $statement->execute();
        $res=$statement->get_result();
        while ($row=$res->fetch_assoc()){
            $response[]=$row;
        }
    }
    echo json_encode($response);
}

if(isset($_POST['deletedocType'])) {
    $response=new stdClass();
    $response->status=false;
    $response->message='';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $docTypeId=$_POST['doctypeId'];
        $query="DELETE FROM document_type WHERE document_type.id=?";
        $statement=$con->prepare($query);
        $statement->bind_param("s",$docTypeId);
        $state=$statement->execute();
        if($state){
            $response->status=true;
            $response->message="Document Type deleted..!";
        }else{
            $response->message=$statement->error;
        }
    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}
