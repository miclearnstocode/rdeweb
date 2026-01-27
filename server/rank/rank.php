<?php
include(__DIR__ . '/../db.php');

if (isset($_POST['getEval'])) {
    $response = [];
    
    error_log("Rank API called with: eventId=" . ($_POST['eventId'] ?? 'empty') . 
              ", categoryId=" . ($_POST['categoryId'] ?? 'empty'));
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventId = $_POST['eventId'];
        $categoryId = $_POST['categoryId']; // This is actually centerId for new events
        
        if (!$eventId || !$categoryId) {
            error_log("Missing parameters: eventId=$eventId, categoryId=$categoryId");
            echo json_encode($response);
            exit();
        }
        
        // Check if this is a new event (ID >= 13)
        if ($eventId >= 13) {
            // NEW SYSTEM: Use center table and center_id in evaluator
            // Get center info
            $centerQuery = "SELECT name, code FROM center WHERE id = ?";
            $centerStmt = $con->prepare($centerQuery);
            $centerStmt->bind_param("i", $categoryId);
            $centerStmt->execute();
            $centerResult = $centerStmt->get_result();
            
            if ($centerRow = $centerResult->fetch_assoc()) {
                $centerName = $centerRow['name'];
                $centerCode = $centerRow['code'];
                $displayFormat = $centerName . " (" . $centerCode . ")";
                
                // Get evaluators using center_id
                $query = "SELECT evaluator.id, evaluator.eventid, evaluator.fullname 
                          FROM evaluator
                          WHERE evaluator.eventid = ? 
                          AND evaluator.center_id = ?";
                $statement = $con->prepare($query);
                $statement->bind_param('ss', $eventId, $categoryId);
                
            } else {
                error_log("Center not found for ID: $categoryId");
                echo json_encode($response);
                exit();
            }
        } else {
            // OLD SYSTEM: Use category name matching
            $query = "SELECT evaluator.id, evaluator.eventid, category.id as categoryId, evaluator.fullname 
                      FROM evaluator
                      LEFT JOIN category ON evaluator.category = category.name
                      WHERE category.id = ? AND evaluator.eventid = ?";
            $statement = $con->prepare($query);
            $statement->bind_param('ss', $categoryId, $eventId);
        }
        
        $statement->execute();
        $result = $statement->get_result();
        
        $evaluatorCount = 0;
        $documentCount = 0;
        
        while ($row = $result->fetch_assoc()) {
            $evaluatorCount++;
            $data = new stdClass();
            $data->evaluator = $row;
            $data->docs = [];
            
            // Get research documents based on system
            if ($eventId >= 13) {
                // NEW SYSTEM: Try both formats (display format and plain name)
                $query2 = "SELECT rf.id, rf.title, rf.author, rf.campus, rf.category 
                           FROM researchfile rf
                           JOIN event_list el ON el.name = rf.event 
                           JOIN endorsement e ON rf.endorsementid = e.id
                           WHERE el.id = ? 
                           AND e.status = 'accepted'
                           AND (rf.category = ? OR rf.category = ?)";
                $statement2 = $con->prepare($query2);
                $displayFormat = $centerName . " (" . $centerCode . ")";
                $statement2->bind_param("sss", $eventId, $displayFormat, $centerName);
            } else {
                // OLD SYSTEM
                $query2 = "SELECT rf.id, rf.title, rf.author, rf.campus, rf.category 
                           FROM researchfile rf
                           JOIN category c ON c.name = rf.category
                           JOIN event_list el ON el.name = rf.event 
                           JOIN endorsement e ON rf.endorsementid = e.id
                           WHERE c.id = ? AND el.id = ? AND e.status = 'accepted'";
                $statement2 = $con->prepare($query2);
                $statement2->bind_param("ss", $categoryId, $eventId);
            }
            
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
                    
                    // For new system, include center code in the file data
                    if ($eventId >= 13) {
                        $row2['center_code'] = $centerCode;
                        $row2['center_name'] = $centerName;
                        $row2['display_name'] = $displayFormat;
                    }
                    
                    $document->file = $row2;
                    $document->criteria = [];
                    $document->TotalScore = 0;
                    
                    // Get scores for this document from this evaluator
                    $scoreQuery = "SELECT sb.id, c.name, c.description, c.percentage, sb.score 
                                   FROM score_board sb
                                   JOIN criteria c ON sb.criteria_id = c.id
                                   WHERE sb.doc_id = ? AND c.event_id = ? AND sb.eval_id = ?";
                    
                    $scoreState = $con->prepare($scoreQuery);
                    $scoreState->bind_param("sss", $row2['id'], $eventId, $row['id']);
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
    exit();
}