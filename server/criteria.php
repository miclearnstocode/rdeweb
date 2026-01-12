<?php

include('db.php');
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */


if (isset($_POST['criteriaList'])) {
    $response=[];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query="SELECT category.id , category.name FROM category";
        $statement=$con->prepare($query);
        $statement->execute();
        $result=$statement->get_result();
        while ($val=$result->fetch_assoc()){
            $response[]=$val;
        }
    }
    echo json_encode($response);
}

if(isset($_POST['criteriaRequest'])){
    $response=[];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $catId=$_POST['catId'];
        $eventId=$_POST['eventId'];
        $query="SELECT 
criteria.id,
criteria.name,
criteria.description,
criteria.percentage
FROM criteria
LEFT JOIN score_sheet ON criteria.score_sheet_id=score_sheet.id
LEFT JOIN category ON criteria.category_id=category.id
WHERE category.id=? AND criteria.event_id=?";

        $statement=$con->prepare($query);
        $statement->bind_param('ss',$catId,$eventId);
        $statement->execute();
        $result=$statement->get_result();
        echo $statement->error;
        while ($val=$result->fetch_assoc()){
            $response[]=$val;
        }
    }
    echo json_encode($response);
}