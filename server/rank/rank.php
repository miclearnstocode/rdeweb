<?php


include('db.php');
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

if (isset($_POST['getEval'])) {
    $response = [];
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $query="SELECT evaluator.id,evaluator.eventid ,category.id as categoryId,evaluator.fullname FROM evaluator
LEFt JOIN category ON evaluator.category=category.name
WHERE category.id=? AND evaluator.eventid=? ";
        $statement=$con->prepare($query);
        $statement->bind_param('ss',$_POST['categoryId'],$_POST['eventId']);
        $statement->execute();
        $result=$statement->get_result();
        while ($row = $result->fetch_assoc()) {
            $docsCount=false;
            $data= new stdClass();
            $data->evaluator=$row;
            $data->docs=[];
            $query2="SELECT researchfile.id,researchfile.title,researchfile.author,researchfile.campus FROM researchfile 
LEFT JOIN category ON category.name=researchfile.category
LEFT JOIN event_list ON event_list.name=researchfile.event 
LEFT JOIN endorsement ON researchfile.endorsementid=endorsement.id
WHERE category.id=? AND event_list.id=? AND endorsement.status='accepted'";
            $statement2=$con->prepare($query2);
            $statement2->bind_param("ss",$_POST['categoryId'],$_POST['eventId']);
            $statement2->execute();
            $result2=$statement2->get_result();
            while ($row2=$result2->fetch_assoc()) {
                $abstainQuery="SELECT EXISTS(SELECT abstain.id FROM abstain WHERE abstain.eval_id=? AND abstain.doc_id=?) as Tot";
                $stmAbstain=$con->prepare($abstainQuery);
                $stmAbstain->bind_param("ss",$row['id'],$row2['id']);
                $stmAbstain->execute();
                $resultAbstain=$stmAbstain->get_result();
                while ($absRow=$resultAbstain->fetch_assoc()){
                    if($absRow['Tot']===0){

                    }
                    $document=new stdClass();
                    $document->file=$row2;
                    $document->criteria=[];
                    $document->TotalScore=0;
                    $scoreQuery="SELECT score_board.id,criteria.name,criteria.description,criteria.percentage, score_board.score FROM score_board
LEFT JOIN criteria ON score_board.criteria_id=criteria.id
WHERE score_board.doc_id=? AND criteria.event_id=? AND score_board.eval_id=?";
                    $scoreState=$con->prepare($scoreQuery);
                    $scoreState->bind_param("sss",$row2['id'],$_POST['eventId'],$row['id']);
                    $scoreState->execute();
                    $resultScore=$scoreState->get_result();
                    while ($row3=$resultScore->fetch_assoc()){
                        $document->criteria[]=$row3;
                        $docsCount=true;
                        $document->TotalScore+=$row3['score'];
                    }
                    $data->docs[]=$document;
                }

            }
            if($docsCount){
                $response[]=$data;
            }

        }
    }
    echo json_encode($response);
}

