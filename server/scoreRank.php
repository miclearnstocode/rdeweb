<?php

// Set header FIRST before any output
header('Content-Type: application/json; charset=utf-8');

// Start output buffering to catch any notices/warnings
ob_start();

include('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

if (isset($_POST['scoreRank'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT category.id ,category.name, COUNT(researchfile.category) as total FROM category
LEFT JOIN researchfile ON category.name=researchfile.category
RIGHT JOIN endorsement ON researchfile.endorsementid=endorsement.id
LEFT JOIN event_list ON  researchfile.event=event_list.name
WHERE endorsement.status='accepted' AND event_list.id=?
GROUP BY researchfile.category";
        $statement = $con->prepare($query);
        $statement->bind_param("i", $_POST['getEventId']);
        $statement->execute();
        $result = $statement->get_result();
        while ($row = $result->fetch_assoc()) {
            $response[] = $row;
        }
    }
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}

if (isset($_POST['getEventName'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query = "SELECT event_list.name FROM event_list WHERE event_list.id=?";
        $statement = $con->prepare($query);
    
        $eventId = $_POST['eventId'] ?? $_POST['getEventName'] ?? '';// Fix: Use $_POST['eventId'] instead of $_POST['getEventName']
        $statement->bind_param("s", $eventId);                     // Or check which parameter is actually being sent
        
        $statement->execute();
        $result = $statement->get_result();
        
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $response[] = $row;
            }
        } else {
            $response[] = ['name' => 'Unknown Event'];
        }
    } else {
        $response[] = ['name' => 'Database Error'];
    }
    
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}

if (isset($_POST['getCatIdName'])) {
    $response = [];
    $query = "SELECT category.name FROM category WHERE category.id=?";
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $statement = $con->prepare($query);
        $statement->bind_param("i", $_POST['getCatIdName']);
        $statement->execute();
        $result = $statement->get_result();
        while ($row = $result->fetch_assoc()) {
            $response[] = $row;
        }
    }
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}

if (isset($_POST['getDocPerRank'])) {

    $response=[];

    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $queryA = "SELECT researchfile.title,researchfile.id,category.name FROM researchfile
LEFT  JOIN endorsement ON researchfile.endorsementid=endorsement.id
LEFT JOIN event_list ON researchfile.event=event_list.name
LEFT JOIN category ON researchfile.category=category.name
WHERE endorsement.status='accepted' AND category.id=? AND event_list.id=?";

        $eventId=$_POST['eventId'];
        $categoryId=$_POST['categoryId'];
        $statement=$con->prepare($queryA);
        $statement->bind_param("ss",$categoryId,$eventId);
        $statement->execute();
        $result=$statement->get_result();

        while ($row = $result->fetch_assoc()) {

            $doc=new stdClass();
            $doc->name=$row['title'];
            $doc->criteria=[];
            $queryB="SELECT 
evaluator.fullname,
score_board.id,
criteria.name,
criteria.description,
concat(criteria.percentage,'%') as percentage,
score_board.score,
round(score_board.score*(criteria.percentage/100),2) as scorePercent 
FROM score_board
LEFT JOIN criteria ON score_board.criteria_id=criteria.id
LEFT JOIN evaluator ON score_board.eval_id=evaluator.id
WHERE score_board.doc_id=? 
ORDER BY evaluator.id";
            $statement2=$con->prepare($queryB);
            $statement2->bind_param("s",$row['id']);
            $statement2->execute();
            $resultScoreBoard=$statement2->get_result();
            while ($row2 = $resultScoreBoard->fetch_assoc()) {
                $doc->criteria[]=$row2;
            }
            $response[]=$doc;
        }

    }
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}