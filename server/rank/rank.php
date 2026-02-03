<?php
include(__DIR__ . '/../db.php');

// DISABLE ALL OUTPUT EXCEPT JSON
error_reporting(0);
ini_set('display_errors', 0);
ob_start(); // Start output buffering early

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

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
                    $centerName = $centerRow['name'];
                    $centerCode = $centerRow['code'];
                    
                    // Get evaluators assigned to this center for this event
                    $evalQuery = "SELECT DISTINCT
                        evaluator.id,
                        evaluator.fullname
                    FROM evaluator
                    WHERE evaluator.eventid = ?
                    AND (evaluator.center_id = ? OR evaluator.center_id IS NULL OR evaluator.center_id = 0)
                    ORDER BY evaluator.fullname";
                    
                    $evalStmt = $con->prepare($evalQuery);
                    $evalStmt->bind_param("ii", $eventId, $categoryId);
                    $evalStmt->execute();
                    $evalResult = $evalStmt->get_result();
                    
                    while($row = $evalResult->fetch_assoc()) {
                        $eval = new stdClass();
                        $eval->evaluator = $row;
                        $eval->docs = [];
                        
                        // Get documents for this evaluator within the selected center
                        // Use LIKE to match center name with different formats
                        $docQuery = "SELECT 
                            rf.id,
                            rf.title,
                            rf.author,
                            rf.campus,
                            rf.category,
                            rf.center,
                            rf.center as display_name,
                            ? as center_code
                        FROM researchfile rf
                        INNER JOIN score_board sb ON rf.id = sb.doc_id
                        INNER JOIN endorsement e ON rf.endorsementid = e.id
                        WHERE sb.eval_id = ?
                        AND rf.event_id = ?
                        AND (rf.center LIKE ? OR rf.center LIKE ?)
                        AND e.status = 'accepted'
                        GROUP BY rf.id";
                        
                        $docStmt = $con->prepare($docQuery);
                        
                        // multiple patterns to match the center
                        $centerPattern1 = "%" . $centerName . "%";
                        $centerPattern2 = "%" . $centerCode . "%";
                        
                        $docStmt->bind_param("siiss", $centerCode, $row['id'], $eventId, $centerPattern1, $centerPattern2);
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
                        
                        // Only add evaluator if they have documents in this center
                        if (count($eval->docs) > 0) {
                            $response[] = $eval;
                        }
                    }
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
                    AND (evaluator.category = ? OR evaluator.category IS NULL OR evaluator.category = '')
                    ORDER BY evaluator.fullname";
                    
                    $evalStmt = $con->prepare($evalQuery);
                    $evalStmt->bind_param("is", $eventId, $categoryName);
                    $evalStmt->execute();
                    $evalResult = $evalStmt->get_result();
                    
                    while($row = $evalResult->fetch_assoc()) {
                        $eval = new stdClass();
                        $eval->evaluator = $row;
                        $eval->docs = [];
                        
                        // Get documents for this evaluator within the selected category
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
                        AND (rf.category = ? OR rf.category LIKE ?)
                        AND e.status = 'accepted'
                        GROUP BY rf.id";
                        
                        $docStmt = $con->prepare($docQuery);
                        $categoryPattern = "%" . $categoryName . "%";
                        $docStmt->bind_param("iiss", $row['id'], $eventId, $categoryName, $categoryPattern);
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
                        
                        // Only add evaluator if they have documents in this category
                        if (count($eval->docs) > 0) {
                            $response[] = $eval;
                        }
                    }
                }
            }
        }
        
        // If no data found, return empty array
        if (empty($response)) {
            // Log for debugging
            error_log("No data found for eventId: $eventId, categoryId: $categoryId, isNewSystem: " . ($isNewSystem ? 'true' : 'false'));
        }
        if (ob_get_length() > 0) {
            ob_end_flush();
        }
    }
    
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
    exit();
}