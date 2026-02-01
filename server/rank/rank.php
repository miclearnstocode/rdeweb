<?php
include(__DIR__ . '/../db.php');

if(isset($_POST['getEval'])) {
    $response = [];
    
    if($con = new mysqli($host, $username, $pass, $dbName)) {
        $eventId = $_POST['eventId'];
        $categoryId = $_POST['categoryId']; // This is center_id for new system, category_id for old system
        
        // Determine system type based on event ID
        $isNewSystem = ($eventId >= 13);
        
        // Get evaluators for the specific category/center
        if ($isNewSystem) {
            // NEW SYSTEM: Get by center
            if ($categoryId > 0) {
                // Get center details
                $centerQuery = "SELECT name, code FROM center WHERE id = ?";
                $centerStmt = $con->prepare($centerQuery);
                $centerStmt->bind_param("i", $categoryId);
                $centerStmt->execute();
                $centerResult = $centerStmt->get_result();
                
                if ($centerRow = $centerResult->fetch_assoc()) {
                    $centerDisplay = $centerRow['name'] . " (" . $centerRow['code'] . ")";
                    
                    // Get evaluators assigned to this center for this event
                    $evalQuery = "SELECT DISTINCT
                        evaluator.id,
                        evaluator.fullname
                    FROM evaluator
                    WHERE evaluator.eventid = ?
                    AND (evaluator.center_id = ? OR evaluator.center_id IS NULL)
                    ORDER BY evaluator.fullname";
                    
                    $evalStmt = $con->prepare($evalQuery);
                    $evalStmt->bind_param("ii", $eventId, $categoryId);
                }
            }
        } else {
            // OLD SYSTEM: Get by category
            if ($categoryId > 0) {
                // Get category details
                $categoryQuery = "SELECT name FROM category WHERE id = ?";
                $catStmt = $con->prepare($categoryQuery);
                $catStmt->bind_param("i", $categoryId);
                $catStmt->execute();
                $catResult = $catStmt->get_result();
                
                if ($catRow = $catResult->fetch_assoc()) {
                    $categoryName = $catRow['name'];
                    
                    // Get evaluators assigned to this category for this event
                    $evalQuery = "SELECT DISTINCT
                        evaluator.id,
                        evaluator.fullname
                    FROM evaluator
                    WHERE evaluator.eventid = ?
                    AND (evaluator.category = ? OR evaluator.category IS NULL)
                    ORDER BY evaluator.fullname";
                    
                    $evalStmt = $con->prepare($evalQuery);
                    $evalStmt->bind_param("is", $eventId, $categoryName);
                }
            }
        }
        
        if (isset($evalStmt)) {
            $evalStmt->execute();
            $evalResult = $evalStmt->get_result();
            
            while($row = $evalResult->fetch_assoc()) {
                $eval = new stdClass();
                $eval->evaluator = $row;
                $eval->docs = [];
                
                // Get documents for this evaluator within the selected category/center
                if ($isNewSystem && $categoryId > 0) {
                    // NEW SYSTEM: Get documents by center
                    $centerQuery = "SELECT name, code FROM center WHERE id = ?";
                    $centerStmt = $con->prepare($centerQuery);
                    $centerStmt->bind_param("i", $categoryId);
                    $centerStmt->execute();
                    $centerResult = $centerStmt->get_result();
                    $centerRow = $centerResult->fetch_assoc();
                    $centerDisplay = $centerRow['name'] . " (" . $centerRow['code'] . ")";
                    
                    $docQuery = "SELECT 
                        rf.id,
                        rf.title,
                        rf.author,
                        rf.campus,
                        rf.category,
                        rf.center,
                        rf.center as display_name,
                        '' as center_code
                    FROM researchfile rf
                    INNER JOIN score_board sb ON rf.id = sb.doc_id
                    INNER JOIN endorsement e ON rf.endorsementid = e.id
                    WHERE sb.eval_id = ?
                    AND rf.event_id = ?
                    AND rf.center = ?
                    AND e.status = 'accepted'
                    GROUP BY rf.id";
                    
                    $docStmt = $con->prepare($docQuery);
                    $docStmt->bind_param("iis", $row['id'], $eventId, $centerDisplay);
                    
                } elseif (!$isNewSystem && $categoryId > 0) {
                    // OLD SYSTEM: Get documents by category
                    $categoryQuery = "SELECT name FROM category WHERE id = ?";
                    $catStmt = $con->prepare($categoryQuery);
                    $catStmt->bind_param("i", $categoryId);
                    $catStmt->execute();
                    $catResult = $catStmt->get_result();
                    $catRow = $catResult->fetch_assoc();
                    $categoryName = $catRow['name'];
                    
                    $docQuery = "SELECT 
                        rf.id,
                        rf.title,
                        rf.author,
                        rf.campus,
                        rf.category,
                        rf.center,
                        rf.category as display_name,
                        '' as center_code
                    FROM researchfile rf
                    INNER JOIN score_board sb ON rf.id = sb.doc_id
                    INNER JOIN endorsement e ON rf.endorsementid = e.id
                    WHERE sb.eval_id = ?
                    AND rf.event_id = ?
                    AND rf.category = ?
                    AND e.status = 'accepted'
                    GROUP BY rf.id";
                    
                    $docStmt = $con->prepare($docQuery);
                    $docStmt->bind_param("iis", $row['id'], $eventId, $categoryName);
                }
                
                if (isset($docStmt)) {
                    $docStmt->execute();
                    $docResult = $docStmt->get_result();
                    
                    while($docRow = $docResult->fetch_assoc()) {
                        $doc = new stdClass();
                        $doc->file = $docRow;
                        $doc->TotalScore = 0;
                        $doc->criteria = [];
                        
                        // Get scores for this document by this evaluator
                        $scoreQuery = "SELECT 
                            c.id as criteria_id,
                            c.name,
                            c.percentage,
                            sb.score
                        FROM score_board sb
                        LEFT JOIN criteria c ON sb.criteria_id = c.id
                        WHERE sb.doc_id = ?
                        AND sb.eval_id = ?
                        ORDER BY c.id";
                        
                        $scoreStmt = $con->prepare($scoreQuery);
                        $scoreStmt->bind_param("ii", $docRow['id'], $row['id']);
                        $scoreStmt->execute();
                        $scoreResult = $scoreStmt->get_result();
                        
                        $rawTotal = 0;
                        
                        while($scoreRow = $scoreResult->fetch_assoc()) {
                            $doc->criteria[] = $scoreRow;
                            $rawTotal += $scoreRow['score'];
                        }
                        
                        $doc->TotalScore = $rawTotal;
                        $eval->docs[] = $doc;
                    }
                }
                
                // Only add evaluator if they have documents in this category/center
                if (count($eval->docs) > 0) {
                    $response[] = $eval;
                }
            }
        }
    }
    
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}