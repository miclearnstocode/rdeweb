<?php
include(__DIR__ . '/../db.php');

if (isset($_POST['getEval'])) {
    $response = [];
    
    // Add debugging logs
    error_log("Rank API called with: eventId=" . ($_POST['eventId'] ?? 'empty') . 
              ", categoryId=" . ($_POST['categoryId'] ?? 'empty'));
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Get evaluators for this event and category
        $query = "SELECT evaluator.id, evaluator.eventid, category.id as categoryId, evaluator.fullname 
                  FROM evaluator
                  LEFT JOIN category ON evaluator.category = category.name
                  WHERE category.id = ? AND evaluator.eventid = ?";
        $statement = $con->prepare($query);
        $statement->bind_param('ss', $_POST['categoryId'], $_POST['eventId']);
        $statement->execute();
        $result = $statement->get_result();
        
        $evaluatorCount = 0;
        $documentCount = 0;
        
        while ($row = $result->fetch_assoc()) {
            $evaluatorCount++;
            $data = new stdClass();
            $data->evaluator = $row;
            $data->docs = [];
            
            // Get ALL research documents for this event and category
            $query2 = "SELECT rf.id, rf.title, rf.author, rf.campus 
                       FROM researchfile rf
                       JOIN category c ON c.name = rf.category
                       JOIN event_list el ON el.name = rf.event 
                       JOIN endorsement e ON rf.endorsementid = e.id
                       WHERE c.id = ? AND el.id = ? AND e.status = 'accepted'";
            
            $statement2 = $con->prepare($query2);
            $statement2->bind_param("ss", $_POST['categoryId'], $_POST['eventId']);
            $statement2->execute();
            $result2 = $statement2->get_result();
            
            $hasScoredDocs = false;
            
            while ($row2 = $result2->fetch_assoc()) {
                $documentCount++;
                
                // Check if evaluator abstained from this document
                $abstainQuery = "SELECT COUNT(*) as abstain_count 
                                 FROM abstain 
                                 WHERE eval_id = ? AND doc_id = ?";
                $stmAbstain = $con->prepare($abstainQuery);
                $stmAbstain->bind_param("ss", $row['id'], $row2['id']);
                $stmAbstain->execute();
                $resultAbstain = $stmAbstain->get_result();
                $absRow = $resultAbstain->fetch_assoc();
                
                // Only include if NOT abstained (abstain_count === 0)
                if ($absRow['abstain_count'] == 0) {
                    $document = new stdClass();
                    $document->file = $row2;
                    $document->criteria = [];
                    $document->TotalScore = 0;
                    
                    // Get scores for this document from this evaluator
                    $scoreQuery = "SELECT sb.id, c.name, c.description, c.percentage, sb.score 
                                   FROM score_board sb
                                   JOIN criteria c ON sb.criteria_id = c.id
                                   WHERE sb.doc_id = ? AND c.event_id = ? AND sb.eval_id = ?";
                    
                    $scoreState = $con->prepare($scoreQuery);
                    $scoreState->bind_param("sss", $row2['id'], $_POST['eventId'], $row['id']);
                    $scoreState->execute();
                    $resultScore = $scoreState->get_result();
                    
                    $hasScores = false;
                    while ($row3 = $resultScore->fetch_assoc()) {
                        $document->criteria[] = $row3;
                        $document->TotalScore += $row3['score'];
                        $hasScores = true;
                        $hasScoredDocs = true;
                    }
                    
                    // Only add document if it has scores
                    if ($hasScores) {
                        $data->docs[] = $document;
                    }
                }
            }
            
            // Only add evaluator if they have scored documents
            if ($hasScoredDocs) {
                $response[] = $data;
            }
        }
        
        // Debug log
        error_log("Rank API results: $evaluatorCount evaluators, $documentCount documents, " . 
                  count($response) . " evaluators with scores");
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
}