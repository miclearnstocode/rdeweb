<?php
include_once('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */


if(isset($_POST['checkDeadLine'])){
    $response=new stdClass();
    $response->status=false;
    $response->message='';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eveId=$_POST['eventId'];
        $query="SELECT event_list.dead_line FROM event_list WHERE event_list.id=? AND event_list.dead_line>CURRENT_TIMESTAMP";
        $statement= $con->prepare($query);
        $statement->bind_param('s',$eveId);
        $statement->execute();
        $result=$statement->get_result()->fetch_row();

        if($result!==NULL){
            $response->status=true;
        }
    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}
