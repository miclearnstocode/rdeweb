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
error_reporting(0);

// Map category names to IDs
function getCategoryId($categoryName) {
    $categoryMap = [
        'Social Science' => 1,
        'Natural / Biological' => 2,
        'Natural/Biological' => 2,
        'Food' => 3,
        'Development' => 4,
        'Extension' => 5
    ];
    
    return $categoryMap[$categoryName] ?? null;
}

if (isset($_POST['scoreboard_req'])) {
    $response = [];
    
    try {
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            // Check connection
            if ($con->connect_error) {
                throw new Exception("Database connection failed: " . $con->connect_error);
            }
            
            // Check if user is logged in
            if (!isset($_SESSION['userId'])) {
                echo json_encode(['error' => 'User not logged in']);
                exit();
            }
            
            $userId = $_SESSION['userId'];
            
            // Get the docId (researchfile.id)
            if (!isset($_POST['docId'])) {
                echo json_encode(['error' => 'Document ID not provided']);
                exit();
            }
            
            $docId = $_POST['docId'];
            
            // First, get the evaluator's center_id from evaluator table
            $evalQuery = "SELECT center_id FROM evaluator WHERE id = ?";
            $evalStmt = $con->prepare($evalQuery);
            if (!$evalStmt) {
                throw new Exception("Failed to prepare evaluator query: " . $con->error);
            }
            $evalStmt->bind_param("i", $userId);
            $evalStmt->execute();
            $evalResult = $evalStmt->get_result();
            
            if (!$evalRow = $evalResult->fetch_assoc()) {
                echo json_encode(['error' => 'Evaluator not found']);
                exit();
            }
            
            $centerId = $evalRow['center_id'];
            
            // Get the researchfile details - use 'category' column (not 'category_id')
            $eventQuery = "SELECT rf.event_id, rf.event, rf.category 
                          FROM researchfile rf
                          WHERE rf.id = ?";
            $eventStmt = $con->prepare($eventQuery);
            if (!$eventStmt) {
                throw new Exception("Failed to prepare event query: " . $con->error);
            }
            $eventStmt->bind_param("i", $docId);
            $eventStmt->execute();
            $eventResult = $eventStmt->get_result();
            
            if (!$eventRow = $eventResult->fetch_assoc()) {
                echo json_encode(['error' => 'Research file not found']);
                exit();
            }
            
            $eventId = $eventRow['event_id'];
            $categoryName = $eventRow['category'] ?? '';
            $eventName = $eventRow['event'] ?? '';
            
            // If event_id is NULL, try to get it from event name
            if (empty($eventId) && !empty($eventName)) {
                $eventNameQuery = "SELECT id FROM event_list WHERE name = ? LIMIT 1";
                $eventNameStmt = $con->prepare($eventNameQuery);
                if ($eventNameStmt) {
                    $eventNameStmt->bind_param("s", $eventName);
                    $eventNameStmt->execute();
                    $eventNameResult = $eventNameStmt->get_result();
                    
                    if ($eventNameRow = $eventNameResult->fetch_assoc()) {
                        $eventId = $eventNameRow['id'];
                    }
                }
            }
            
            // Determine if it's a Symposium or In-House based on event name
            $isSymposium = false;
            if (!empty($eventName)) {
                // Check if event name contains 'symposium' (case-insensitive)
                if (stripos($eventName, 'symposium') !== false) {
                    $isSymposium = true;
                }
            } else if (!empty($eventId)) {
                // If event name is empty, get it from event_list
                $eventNameQuery = "SELECT name FROM event_list WHERE id = ? LIMIT 1";
                $eventNameStmt = $con->prepare($eventNameQuery);
                if ($eventNameStmt) {
                    $eventNameStmt->bind_param("i", $eventId);
                    $eventNameStmt->execute();
                    $eventNameResult = $eventNameStmt->get_result();
                    
                    if ($eventNameRow = $eventNameResult->fetch_assoc()) {
                        $eventName = $eventNameRow['name'];
                        if (stripos($eventName, 'symposium') !== false) {
                            $isSymposium = true;
                        }
                    }
                }
            }
            
            // Get criteria based on event_id and event type
            if (empty($eventId)) {
                echo json_encode(['error' => 'Event not found for this document']);
                exit();
            }
            
            if ($isSymposium) {
                // SYMPOSIUM: Use category
                // Map category name to ID
                $categoryId = getCategoryId($categoryName);
                
                if (empty($categoryId)) {
                    // If category is not mapped, try to get all criteria for the event
                    $query = "SELECT 
                        criteria.id as criteria_id, 
                        criteria.name, 
                        criteria.description, 
                        criteria.percentage 
                    FROM criteria
                    WHERE criteria.event_id = ?
                    ORDER BY criteria.id";
                    
                    $statement = $con->prepare($query);
                    if ($statement) {
                        $statement->bind_param("i", $eventId);
                        $statement->execute();
                        $result = $statement->get_result();
                        
                        while ($val = $result->fetch_assoc()) {
                            $response[] = $val;
                        }
                        $statement->close();
                    }
                } else {
                    // Research categories (1-4) share criteria
                    // Extension (5) has its own criteria
                    if (in_array($categoryId, [1, 2, 3, 4])) {
                        // Show criteria from ALL research categories (1-4)
                        $query = "SELECT 
                            criteria.id as criteria_id, 
                            criteria.name, 
                            criteria.description, 
                            criteria.percentage 
                        FROM criteria
                        WHERE criteria.event_id = ? 
                        AND criteria.category_id IN (1, 2, 3, 4)
                        ORDER BY criteria.id";
                        
                        $statement = $con->prepare($query);
                        if ($statement) {
                            $statement->bind_param("i", $eventId);
                            $statement->execute();
                            $result = $statement->get_result();
                            
                            while ($val = $result->fetch_assoc()) {
                                $response[] = $val;
                            }
                            $statement->close();
                        }
                    } else if ($categoryId == 5) {
                        // Show only Extension criteria
                        $query = "SELECT 
                            criteria.id as criteria_id, 
                            criteria.name, 
                            criteria.description, 
                            criteria.percentage 
                        FROM criteria
                        WHERE criteria.event_id = ? 
                        AND criteria.category_id = 5
                        ORDER BY criteria.id";
                        
                        $statement = $con->prepare($query);
                        if ($statement) {
                            $statement->bind_param("i", $eventId);
                            $statement->execute();
                            $result = $statement->get_result();
                            
                            while ($val = $result->fetch_assoc()) {
                                $response[] = $val;
                            }
                            $statement->close();
                        }
                    } else {
                        // Fallback: try to get any criteria for this category
                        $query = "SELECT 
                            criteria.id as criteria_id, 
                            criteria.name, 
                            criteria.description, 
                            criteria.percentage 
                        FROM criteria
                        WHERE criteria.event_id = ? 
                        AND criteria.category_id = ?
                        ORDER BY criteria.id";
                        
                        $statement = $con->prepare($query);
                        if ($statement) {
                            $statement->bind_param("ii", $eventId, $categoryId);
                            $statement->execute();
                            $result = $statement->get_result();
                            
                            while ($val = $result->fetch_assoc()) {
                                $response[] = $val;
                            }
                            $statement->close();
                        }
                    }
                }
            } else {
                // IN-HOUSE: Use center_id
                $query = "SELECT 
                    criteria.id as criteria_id, 
                    criteria.name, 
                    criteria.description, 
                    criteria.percentage 
                FROM criteria
                WHERE criteria.event_id = ? 
                AND criteria.center_id = ?
                ORDER BY criteria.id";
                
                $statement = $con->prepare($query);
                if ($statement) {
                    $statement->bind_param("ii", $eventId, $centerId);
                    $statement->execute();
                    $result = $statement->get_result();
                    
                    while ($val = $result->fetch_assoc()) {
                        $response[] = $val;
                    }
                    $statement->close();
                }
            }
            
            // Close connections
            if (isset($evalStmt)) $evalStmt->close();
            if (isset($eventStmt)) $eventStmt->close();
            $con->close();
            
        } else {
            throw new Exception("Could not connect to database");
        }
    } catch (Exception $e) {
        error_log("Scoreboard error: " . $e->getMessage());
        echo json_encode(['error' => $e->getMessage()]);
        exit();
    }
    
    // Ensure we always return a valid JSON array
    if (!is_array($response)) {
        $response = [];
    }
    echo json_encode($response);
    exit();
}

if (isset($_POST['scoreReq'])) {
    $response = [];
    
    try {
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            // Check connection
            if ($con->connect_error) {
                throw new Exception("Database connection failed: " . $con->connect_error);
            }
            
            // Check if user is logged in
            if (!isset($_SESSION['userId'])) {
                echo json_encode(['error' => 'User not logged in']);
                exit();
            }
            
            $userId = $_SESSION['userId'];
            $docId = $_POST['docId'] ?? 0;
            $criteriaId = $_POST['criteria_id'] ?? 0;
            
            if (empty($docId) || empty($criteriaId)) {
                echo json_encode([]);
                exit();
            }
            
            // Check if evaluator has abstained from this document
            $checkQuery = "SELECT EXISTS(SELECT 1 FROM abstain WHERE eval_id = ? AND doc_id = ?) as Total";
            $stm = $con->prepare($checkQuery);
            if ($stm) {
                $stm->bind_param("ii", $userId, $docId);
                $stm->execute();
                $res = $stm->get_result();
                $r1 = $res->fetch_assoc();
                
                if ($r1 && $r1['Total'] === 0) {
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
                    if ($statement) {
                        $statement->bind_param("iii", $docId, $criteriaId, $userId);
                        $statement->execute();
                        $result = $statement->get_result();
                        
                        while ($val = $result->fetch_assoc()) {
                            $response[] = $val;
                        }
                        $statement->close();
                    }
                }
                $stm->close();
            }
            
            $con->close();
        }
    } catch (Exception $e) {
        error_log("Score request error: " . $e->getMessage());
        echo json_encode([]);
        exit();
    }
    
    echo json_encode($response);
    exit();
}

if (isset($_POST['scoreSave'])) {
    $response = new stdClass();
    $response->status = false;
    $response->message = '';
    
    try {
        if ($con = new mysqli($host, $username, $pass, $dbName)) {
            // Check connection
            if ($con->connect_error) {
                throw new Exception("Database connection failed: " . $con->connect_error);
            }
            
            // Check if user is logged in
            if (!isset($_SESSION['userId'])) {
                $response->message = 'User not logged in';
                echo json_encode($response);
                exit();
            }
            
            $userId = $_SESSION['userId'];
            $docId = $_POST['docId'] ?? 0;
            
            if (empty($docId)) {
                $response->message = 'Document ID is required';
                echo json_encode($response);
                exit();
            }
            
            $scores = $_POST['Score'] ?? []; // array
            $criteriaIds = $_POST['criteriaId'] ?? []; // array
            
            if (empty($scores) || empty($criteriaIds)) {
                $response->message = 'No scores to save';
                echo json_encode($response);
                exit();
            }
            
            // Use transaction for data consistency
            $con->begin_transaction();
            
            try {
                foreach ($criteriaIds as $key => $criteriaId) {
                    $score = $scores[$key] ?? 0;
                    
                    // Check if score already exists
                    $checkQuery = "SELECT COUNT(*) as count 
                                  FROM score_board 
                                  WHERE doc_id = ? 
                                  AND criteria_id = ? 
                                  AND eval_id = ?";
                    $checkStmt = $con->prepare($checkQuery);
                    if (!$checkStmt) {
                        throw new Exception("Failed to prepare check query: " . $con->error);
                    }
                    $checkStmt->bind_param('iii', $docId, $criteriaId, $userId);
                    $checkStmt->execute();
                    $checkResult = $checkStmt->get_result();
                    $checkRow = $checkResult->fetch_assoc();
                    $checkStmt->close();
                    
                    if ($checkRow && $checkRow['count'] > 0) {
                        // Update existing score
                        $updateQuery = "UPDATE score_board 
                                       SET score = ? 
                                       WHERE doc_id = ? 
                                       AND criteria_id = ? 
                                       AND eval_id = ?";
                        $updateStmt = $con->prepare($updateQuery);
                        if (!$updateStmt) {
                            throw new Exception("Failed to prepare update query: " . $con->error);
                        }
                        $updateStmt->bind_param("iiii", $score, $docId, $criteriaId, $userId);
                        $updateStmt->execute();
                        $updateStmt->close();
                    } else {
                        // Insert new score
                        $insertQuery = "INSERT INTO score_board (eval_id, doc_id, criteria_id, score) 
                                       VALUES (?, ?, ?, ?)";
                        $insertStmt = $con->prepare($insertQuery);
                        if (!$insertStmt) {
                            throw new Exception("Failed to prepare insert query: " . $con->error);
                        }
                        $insertStmt->bind_param("iiii", $userId, $docId, $criteriaId, $score);
                        $insertStmt->execute();
                        $insertStmt->close();
                    }
                }
                
                $con->commit();
                $response->status = true;
                $response->message = "Score saved successfully";
                
            } catch (Exception $e) {
                $con->rollback();
                throw $e;
            }
            
            $con->close();
            
        } else {
            throw new Exception("Could not connect to database");
        }
    } catch (Exception $e) {
        error_log("Score save error: " . $e->getMessage());
        $response->message = "Error saving score: " . $e->getMessage();
    }
    
    echo json_encode($response);
    exit();
}