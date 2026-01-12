<?php

include('db.php');

/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

if(isset($_POST['checkAbstain'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='';
    if($con = new mysqli($host, $username, $pass, $dbName)){
        $query="SELECT EXISTS(SELECT * FROM abstain WHERE abstain.eval_id=? AND abstain.doc_id=?) as Total";
        $statement=$con->prepare($query);
        $statement->bind_param("ss",$_SESSION['userId'],$_POST['docId']);
        $statement->execute();
        $result=$statement->get_result();
        while ($row=$result->fetch_assoc()){
            $response->status=$row['Total'];
        }
    }
    echo json_encode($response);
}

if(isset($_POST['UpdateAbstain'])){
    $response= new stdClass();
    $response->status=false;
    $response->message='';
    if($con = new mysqli($host, $username, $pass, $dbName)){
        $query="INSERT INTO abstain (abstain.eval_id,abstain.doc_id,abstain.reason) VALUES (?,?,?)";
        $statement=$con->prepare($query);
        $statement->bind_param("sss",$_SESSION['userId'],$_POST['docId'],$_POST['reason']);
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
if(isset($_POST['removeAbstain'])){
    $response= new stdClass();
    $response->status=false;
    $response->message='';
    if($con = new mysqli($host, $username, $pass, $dbName)){
        $query="DELETE FROM abstain WHERE abstain.doc_id=? AND abstain.eval_id=?";
        $statement=$con->prepare($query);
        $statement->bind_param("ss",$_POST['docId'],$_SESSION['userId']);
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