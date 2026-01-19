<?php

include_once('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

date_default_timezone_set('Asia/Manila');
if (isset($_POST['updateDeadline'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query="UPDATE event_list SET event_list.dead_line=? WHERE event_list.id=?";
        $eventId=$_POST['eventId'];
        $newDate=$_POST['newDate'];
        $statement=$con->prepare($query);
        $tm=explode("T",$newDate);
        $statement->bind_param("ss",$newDate,$eventId);
        $result=$statement->execute();
        if($result){
            $userId = $_SESSION['userName'];
            $details = "Deadline was updated to $tm[0] by:$userId";
            $docId=0;
            $defaultTime=date('Y-m-d H:i:s');
            $logQuery = "INSERT INTO document_log (document_log.user_id,document_log.doc_id,document_log.details,document_log.date) VALUES (?,?,?,?)";

            $stm = $con->prepare($logQuery);

            $stm->bind_param('ssss', $userId, $docId, $details,$defaultTime);

            $status = $stm->execute();

            if ($status) {

                $response->status=true;
                $response->message='Success...!';

            } else {

                $response->message = $stm->error;

            }

        }else{
            $response->message=$statement->error;
        }
    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}