<?php

include_once('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */


if (isset($_POST['logRequest'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query="SELECT 
document_log.id,
document_log.user_id as userID,
document_log.doc_id as docId,
rdestaff.email as rdeName,
document_log.details,
document_log.date
FROM document_log
LEFT JOIN rdestaff ON document_log.user_id=rdestaff.id";
        $statement=$con->prepare($query);
        $statement->execute();
        $res=$statement->get_result();
        while ($row = $res->fetch_assoc()){
            $response[]=$row;
        }

    }
    echo json_encode($response);
}