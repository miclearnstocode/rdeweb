<?php
include ('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */
$con=new mysqli($host,$username,$pass,$dbName);
date_default_timezone_set('Asia/Manila');


if(isset($_POST['recommend'])){
    $response=new stdClass();
    $response->status=false;
    $response->message="";
  //  $data = unserialize($_SESSION['isLog']);
    if($con){

        $query="INSERT INTO recomendation (recomendation.userid,recomendation.recom) VALUES (?,?)";
        $statement=$con->prepare($query);
        $sender=$_SESSION['userId'];
        $recommend=$_POST['recommendContent'];
        $statement->bind_param('ss',$sender,$recommend);
        $status=$statement->execute();
        if($status){
            $response->status=true;
            $response->message="Suggestion / Recommendation will be review by our technical team..! \n Thank you for your concerned...";
        }else{
            $response->message=$statement->error;
        }
    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}

if(isset($_POST['recommendationRequest'])){
    $data=[];
    if($con){
        $query="SELECT recomendation.id,recomendation.userid,recomendation.recom,recomendation.date,capsu_user.username FROM recomendation
LEFT JOIN capsu_user ON recomendation.userid=capsu_user.id";
        $statement=$con->prepare($query);
        $statement->execute();
        $res=$statement->get_result();
        while ($val=$res->fetch_assoc()){
            $data[]=$val;
        }
    }
    echo json_encode($data);
}