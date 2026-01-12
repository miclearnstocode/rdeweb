<?php
include('db.php');
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */


if(isset($_POST['eventReg'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $name=$_POST['eventName'];
        $query="INSERT INTO event_list (event_list.name,event_list.status) VALUES ('$name',false )";
        if($con->query($query)){
            $logQuery = "INSERT INTO document_log (document_log.user_id,document_log.doc_id,document_log.details) VALUES (?,?,?)";
            $scQuery="INSERT INTO score_sheet(score_sheet.event_id,score_sheet.event_name) 
SELECT event_list.id,event_list.name FROM event_list WHERE event_list.name=?";
            $statement=$con->prepare($scQuery);
            $statement->bind_param("s",$name);
            $status=$statement->execute();
            if($status){
                $response->status=true;
            }else{
                $response->message=$statement->error;
            }
        }else{
            $response->message=$con->error;
        }
    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}


