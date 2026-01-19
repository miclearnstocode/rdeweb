<?php

include('db.php');
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */


if (isset($_POST['scoreboard_req'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query="SELECT criteria.id as criteria_id,criteria.name,criteria.description,criteria.percentage FROM criteria
LEFT JOIN event_list ON criteria.event_id=event_list.id
LEFT JOIN category ON criteria.category_id=category.id
WHERE category.id=? AND event_list.id=?";
        $statement=$con->prepare($query);
        $statement->bind_param("ss",$_POST['categoryId'],$_POST['eventId']);
        $statement->execute();
        $result=$statement->get_result();
        while ($val=$result->fetch_assoc()){
            $response[]=$val;
        }
    }
    echo json_encode($response);
}

if(isset($_POST['scoreReq'])){
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $checkQuery="SELECT EXISTS(SELECT abstain.eval_id FROM abstain WHERE abstain.eval_id=? AND abstain.doc_id=?) as Total";
        $stm= $con->prepare($checkQuery);
        $stm->bind_param("ss",$_SESSION['userId'],$_POST['docId']);
        $stm->execute();
        $res=$stm->get_result();
        while ($r1=$res->fetch_assoc()){
            if($r1['Total']===0){
                $query = "SELECT score_board.score,score_board.id  as scoreId, score_board.criteria_id FROM score_board
LEFT JOIN criteria  ON score_board.criteria_id = criteria.id
WHERE score_board.doc_id=? AND criteria.id=? AND score_board.eval_id=?";
                $statement = $con->prepare($query);
                $statement->bind_param("sss", $_POST['docId'], $_POST['criteria_id'],$_SESSION['userId']);
                $statement->execute();
                $result = $statement->get_result();
                while ($val = $result->fetch_assoc()) {
                    $response[] = $val;
                }
            }
        }
    }
    echo json_encode($response);
}

if(isset($_POST['scoreSave'])){
    $response = new stdClass();
    $response->status=false;
    $response->message='';
    if ($con = new mysqli($host, $username, $pass, $dbName)) {

        $category=$_POST['category'];
        $docId=$_POST['docId'];
        $score=$_POST['Score'];// array
        $criteriaId=$_POST['criteriaId']; //array
        foreach ($criteriaId as $key=>$value) {
            $query="SELECT COUNT(score_board.doc_id) as sc FROM score_board
LEFT JOIN criteria ON score_board.criteria_id=criteria.id
WHERE score_board.doc_id=? AND criteria.id=? AND score_board.eval_id=?";
            $checkStatement=$con->prepare($query);
            $checkStatement->bind_param('sss',$docId,$criteriaId[$key],$_SESSION['userId']);
            $checkStatement->execute();
            $result=$checkStatement->get_result();
            while ($v=$result->fetch_assoc()) {
                if($v['sc']===0){
                    $queryInsert="INSERT INTO score_board(
                        score_board.eval_id,
                        score_board.doc_id,
                        score_board.criteria_id,
                        score_board.score
                            ) VALUES ";
                    $plc=array("?,?,?,?");
                    $postData=[];
                    $rowPlc=" ";
                    foreach ($criteriaId as $crtKey=>$crtValue) {
                        $rowPlc.="(".implode(",",$plc)." )";
                        if($crtKey<sizeof($criteriaId)-1){
                            $rowPlc.=" , ";
                        }
                        $postData[]=$_SESSION['userId'];
                        $postData[]=$docId;
                        $postData[]= $crtValue;
                        $postData[]=$score[$crtKey];
                    }

                    $fullQuery=$queryInsert.$rowPlc;
                    $statement=$con->prepare($fullQuery);
                    $statement->bind_param(str_repeat("s",count($postData)),...$postData);
                    $statement->execute();
                    $status=$statement->get_result();
                    if($status) {
                        $response->message = "Successfully inserted";
                        $response->status=true;
                    }else{
                        $response->message = $statement->error;
                    }
                }else{
                    foreach ($criteriaId as $keyUp => $UpValue) {
                        $update="UPDATE score_board SET score_board.score=? WHERE score_board.criteria_id=? AND score_board.doc_id=? AND score_board.eval_id=?";
                        $statement=$con->prepare($update);
                        $statement->bind_param("ssss",$score[$keyUp],$UpValue,$_POST['docId'],$_SESSION['userId']);
                        $status=$statement->execute();
                        if($status) {
                            $response->message = "Successfully inserted";
                            $response->status=true;
                        }else{
                            $response->message = $statement->error;
                        }
                    }
                }
            }
        }

    }else{
        $response->message=$con->error;
    }
    echo json_encode($response);
}