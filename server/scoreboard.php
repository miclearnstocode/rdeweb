<?php
include('db.php');
/** @var TYPE_NAME $username */
/** @var TYPE_NAME $host */
/** @var TYPE_NAME $pass */
/** @var TYPE_NAME $dbName */

// Check if session is already started before starting it
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set proper JSON header
header('Content-Type: application/json; charset=utf-8');

// Turn off error display for production
ini_set('display_errors', 0);

if (isset($_POST['scoreboard_req'])) {
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Check if user is logged in
        if (!isset($_SESSION['userId'])) {
            echo json_encode(['error' => 'User not logged in']);
            exit();
        }
        
        $userId = $_SESSION['userId'];
        
        // Get the docId (researchfile.id)
        if (isset($_POST['docId'])) {
            $docId = $_POST['docId'];
            
            // 1. Get the evaluator's center_id from evaluator table
            $evalQuery = "SELECT center_id FROM evaluator WHERE id = ?";
            $evalStmt = $con->prepare($evalQuery);
            $evalStmt->bind_param("i", $userId);
            $evalStmt->execute();
            $evalResult = $evalStmt->get_result();
            
            if ($evalRow = $evalResult->fetch_assoc()) {
                $centerId = $evalRow['center_id'];
                
                // 2. Get the event_id from researchfile table
                $eventQuery = "SELECT event_id, event FROM researchfile WHERE id = ?";
                $eventStmt = $con->prepare($eventQuery);
                $eventStmt->bind_param("i", $docId);
                $eventStmt->execute();
                $eventResult = $eventStmt->get_result();
                
                if ($eventRow = $eventResult->fetch_assoc()) {
                    $eventId = $eventRow['event_id'];
                    
                    // If event_id is NULL, try to get it from event name
                    if (empty($eventId) && !empty($eventRow['event'])) {
                        $eventNameQuery = "SELECT id FROM event_list WHERE name = ? LIMIT 1";
                        $eventNameStmt = $con->prepare($eventNameQuery);
                        $eventNameStmt->bind_param("s", $eventRow['event']);
                        $eventNameStmt->execute();
                        $eventNameResult = $eventNameStmt->get_result();
                        
                        if ($eventNameRow = $eventNameResult->fetch_assoc()) {
                            $eventId = $eventNameRow['id'];
                        }
                    }
                    
                    // 3. Get criteria based on event_id and center_id
                    if (!empty($eventId) && !empty($centerId)) {
                        $query = "SELECT 
                            criteria.id as criteria_id, 
                            criteria.name, 
                            criteria.description, 
                            criteria.percentage 
                        FROM criteria
                        WHERE criteria.event_id = ? 
                        AND criteria.center_id = ?";
                        
                        $statement = $con->prepare($query);
                        $statement->bind_param("ii", $eventId, $centerId);
                        $statement->execute();
                        $result = $statement->get_result();
                        
                        while ($val = $result->fetch_assoc()) {
                            $response[] = $val;
                        }
                    } else {
                        // Log for debugging
                        error_log("Missing event_id or center_id: event_id=$eventId, center_id=$centerId, docId=$docId");
                    }
                }
            }
        }
    }
    
    echo json_encode($response);
    exit();
}

if (isset($_POST['scoreReq'])) {
    $response = [];
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Check if user is logged in
        if (!isset($_SESSION['userId'])) {
            echo json_encode(['error' => 'User not logged in']);
            exit();
        }
        
        $userId = $_SESSION['userId'];
        $docId = $_POST['docId'];
        $criteriaId = $_POST['criteria_id'];
        
        // Check if evaluator has abstained from this document
        $checkQuery = "SELECT EXISTS(SELECT 1 FROM abstain WHERE eval_id = ? AND doc_id = ?) as Total";
        $stm = $con->prepare($checkQuery);
        $stm->bind_param("ii", $userId, $docId);
        $stm->execute();
        $res = $stm->get_result();
        $r1 = $res->fetch_assoc();
        
        if ($r1['Total'] === 0) {
            // Get the score if it exists
            $query = "SELECT 
                score_board.score, 
                score_board.id as scoreId, 
                score_board.criteria_id 
            FROM score_board
            WHERE score_board.doc_id = ? 
            AND score_board.criteria_id = ? 
            AND score_board.eval_id = ?";
            
            $statement = $con->prepare($query);
            $statement->bind_param("iii", $docId, $criteriaId, $userId);
            $statement->execute();
            $result = $statement->get_result();
            
            while ($val = $result->fetch_assoc()) {
                $response[] = $val;
            }
        }
    }
    
    echo json_encode($response);
    exit();
}

if (isset($_POST['scoreSave'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    if ($con = new mysqli($host, $username, $pass, $dbName)) {
        // Check if user is logged in
        if (!isset($_SESSION['userId'])) {
            $response->message = 'User not logged in';
            echo json_encode($response);
            exit();
        }
        
        $userId = $_SESSION['userId'];
        $docId = $_POST['docId'];
        $scores = $_POST['Score']; // array
        $criteriaIds = $_POST['criteriaId']; // array
        
        // Use transaction for data consistency
        $con->begin_transaction();
        
        try {
            foreach ($criteriaIds as $key => $criteriaId) {
                $score = $scores[$key];
                
                // Check if score already exists
                $checkQuery = "SELECT COUNT(*) as count 
                              FROM score_board 
                              WHERE doc_id = ? 
                              AND criteria_id = ? 
                              AND eval_id = ?";
                $checkStmt = $con->prepare($checkQuery);
                $checkStmt->bind_param('iii', $docId, $criteriaId, $userId);
                $checkStmt->execute();
                $checkResult = $checkStmt->get_result();
                $checkRow = $checkResult->fetch_assoc();
                
                if ($checkRow['count'] > 0) {
                    // Update existing score
                    $updateQuery = "UPDATE score_board 
                                   SET score = ? 
                                   WHERE doc_id = ? 
                                   AND criteria_id = ? 
                                   AND eval_id = ?";
                    $updateStmt = $con->prepare($updateQuery);
                    $updateStmt->bind_param("iiii", $score, $docId, $criteriaId, $userId);
                    $updateStmt->execute();
                } else {
                    // Insert new score
                    $insertQuery = "INSERT INTO score_board (eval_id, doc_id, criteria_id, score) 
                                   VALUES (?, ?, ?, ?)";
                    $insertStmt = $con->prepare($insertQuery);
                    $insertStmt->bind_param("iiii", $userId, $docId, $criteriaId, $score);
                    $insertStmt->execute();
                }
            }
            
            $con->commit();
            $response->status = true;
            $response->message = "Score saved successfully";
            
        } catch (Exception $e) {
            $con->rollback();
            $response->message = "Error saving score: " . $e->getMessage();
        }
    } else {
        $response->message = "Database connection error";
    }
    
    echo json_encode($response);
    exit();
}